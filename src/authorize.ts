import 'core-js';

enum AccessLevel {
  AccessLevel01 = 1,
  AccessLevelFB = 2,
  AccessLevelFD = 3,
}

type CANFrame = {
  bus: number;
  id: number;
  len: number;
  data: number[];
};

let securityLevel = AccessLevel.AccessLevel01;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let waitCallbacks: {
  id: number;
  callback: (frame: CANFrame) => void;
}[] = [];

function waitForFrame(id: number): Promise<CANFrame> {
  return new Promise((resolve) => {
    waitCallbacks.push({
      id,
      callback: resolve,
    });
  });
}

async function sendKeepAlive() {
  let frame: CANFrame | Promise<CANFrame> = waitForFrame(0x7e8);
  can.sendFrame(0, 0x7e0, 2, [0x3e, 0x01]);
  frame = await frame;
  // I don't know why but we wait for the response.
}

function calculateKeyForME96(a_seed: number[]): number[] {
  let seed: number = (a_seed[0] << 8) | a_seed[1];
  let key: number = 0;
  let returnKey: number[] = new Array(2).fill(0);

  key = RetSeed(seed);

  returnKey[0] = (key >> 8) & 0xff;
  returnKey[1] = key & 0xff;
  return returnKey;
}

// TypeScript version of `RetSeed`
function RetSeed(Seed: number): number {
  // Not correct but it works with a patch
  let Component2: number = (0xeb + Seed) & 0xff;

  // Catch Anomalies
  if (Seed >= 0x3808 && Seed < 0xa408) {
    Component2 -= 1;
  }

  return (
    ((Component2 << 9) |
      ((((0x5bf8 + Seed) >> 8) & 0xff) << 1) |
      ((Component2 >> 7) & 1)) &
    0xffff
  );
}

async function requestSecurityAccess(msToWait: number): Promise<boolean> {
  let cmd: number[];
  switch (securityLevel) {
    case AccessLevel.AccessLevel01:
      cmd = [0x02, 0x27, 0x01];
      break;
    case AccessLevel.AccessLevelFB:
      cmd = [0x02, 0x27, 0xfb];
      break;
    case AccessLevel.AccessLevelFD:
      cmd = [0x02, 0x27, 0xfd];
      break;
  }
  let frame: Promise<CANFrame> | CANFrame = waitForFrame(0x7e8);
  can.sendFrame(0, 0x7e0, 3, cmd);
  frame = await frame;

  if (frame.data[1] !== 0x67) {
    // TODO: Translate error value into an error string
    host.log(
      `[SECURITY] Failed to gain access: 0x${frame.data[3].toString(16)}`
    );
    return false;
  }

  if (frame.data[2] == 0xfe || frame.data[2] == 0x02) {
    host.log('[SECURITY] Access granted');
    return true;
  }

  if (frame.data[2] == 0xfd || frame.data[2] == 0xfb || frame.data[2] == 0x01) {
    host.log('[SECURITY] Got seed value from ECU');

    // wait msToWait, whilst sending a keepalive every second
    while (msToWait > 1000) {
      host.log(`Waiting for ${Math.floor(msToWait / 1000)} seconds...`);
      await sleep(1000);
      // Send keep alive
      await sendKeepAlive();
      msToWait -= 1000;
    }

    let seed = [frame.data[3], frame.data[4]];
    if (seed[0] == 0 && seed[1] == 0) {
      return true;
    }

    let key = calculateKeyForME96(seed);
    if (!key) {
      host.log(`[SECURITY] Failed to calculate key.`);
      return false;
    }

    host.log(
      `[SECURITY] Calculated key [0x${key[0].toString(16)}, 0x${key[1].toString(
        16
      )}] from seed [0x${seed[0].toString(16)}, 0x${seed[1].toString(16)}]`
    );

    let keyData: bigint;
    switch (securityLevel) {
      case AccessLevel.AccessLevel01:
        keyData = BigInt(0x022704);
        break;
      case AccessLevel.AccessLevelFB:
        keyData = BigInt(0xfc2704);
        break;
      case AccessLevel.AccessLevelFD:
        keyData = BigInt(0xfe2704);
        break;
    }

    let key1 = key[1];
    key1 *= 0x100000000;
    keyData ^= BigInt(key1);
    let key2 = key[0];
    key2 *= 0x1000000;
    keyData ^= BigInt(key2);

    let keyDataArr = [
      Number((keyData >> BigInt(0x20)) & BigInt(0xff)),
      Number((keyData >> BigInt(0x18)) & BigInt(0xff)),
      Number((keyData >> BigInt(0x10)) & BigInt(0xff)),
      Number((keyData >> BigInt(0x08)) & BigInt(0xff)),
      Number((keyData >> BigInt(0x00)) & BigInt(0xff)),
    ];

    let finalFrame: Promise<CANFrame> | CANFrame = waitForFrame(0x7e8);
    can.sendFrame(0, 0x7e0, 5, keyDataArr);
    finalFrame = await finalFrame;
    if (
      finalFrame.data[1] == 0x67 &&
      (finalFrame.data[2] == 0xfe ||
        finalFrame.data[2] == 0xfc ||
        finalFrame.data[2] == 0x02)
    ) {
      host.log('[SECURITY] Access granted');
      return true;
    }

    if (finalFrame.data[1] == 0x7f && finalFrame.data[2] == 0x27) {
      // TODO: Translate error value into an error string
      host.log(
        `[SECURITY] Failed to gain access: 0x${frame.data[3].toString(16)}`
      );
      return false;
    }

    host.log(`[SECURITY] An unknown error occurred`);
    return false;
  }
  return true;
}

async function setup() {
  can.setFilter(0, 0, 0);

  // Initialize Session
  can.sendFrame(0, 0x11, 2, [0x01, 0x3e]); // i hope?
  host.log('Attempting to gain authorization.');
  let success = await requestSecurityAccess(0);
  host.log(`Gained authorization: ${success}`);
}

function gotCANFrame(bus: number, id: number, len: number, data: number[]) {
  // First things first, check if a frame with this id is being waited for.
  let callbacks = waitCallbacks.filter((waitCb) => waitCb.id == id);
  // Immediately remove the callbacks from the list
  waitCallbacks = waitCallbacks.filter((waitCb) => waitCb.id != id);

  for (const cb of callbacks) {
    cb.callback({ bus, id, len, data });
  }
}
