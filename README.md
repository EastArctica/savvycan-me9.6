# SavvyCAN ME9.6 Utility Scripts

> **Warning**
> **Use at Your Own Risk**: The scripts and code in this repository are for educational and experimental purposes only. By using them, you agree that you understand the risks involved and take full responsibility for any damage to your ECU or other hardware. The author is not liable for any damages that may occur.

## Overview
This repository contains utility scripts for managing Bosch ME9.6 ECUs within the [SavvyCAN](https://github.com/collin80/SavvyCAN) framework. It's primarily inspired and based on the [mattiasclaesson/Trionic](https://github.com/mattiasclaesson/Trionic) project.

🛠 **Current Features**

- `authorize.ts`: Gains authorization for the Bosch ME9.6 ECU.

## Table of Contents
- [SavvyCAN ME9.6 Utility Scripts](#savvycan-me96-utility-scripts)
  - [Overview](#overview)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Usage](#usage)
    - [Using `authorize.ts`](#using-authorizets)
  - [Contributing](#contributing)
  - [License](#license)

## Prerequisites
Ensure you meet the following prerequisites before proceeding:

1. [Node.js](https://www.google.com/search?q=Node.js) and [pnpm](https://pnpm.io/) installed.
2. [SavvyCAN](https://savvycan.com/) software installed.
3. Basic familiarity with TypeScript.
4. An operational Bosch ME9.6 ECU and associated hardware for testing.

## Installation

Clone the repository:

```bash
git clone https://github.com/EastArctica/savvycan-me9.6.git
```

Navigate into the directory:

```bash
cd savvycan-me9.6
```

Install dependencies:

```bash
pnpm install
```

## Usage

### Using `authorize.ts`

To use `authorize.ts`, navigate to the project directory and execute the following to build the scripts:

```bash
pnpm run build
```

Once built, the outputted script in the `dist` directory can be run within the `Scripting Interface` in SavvyCAN.

## Contributing
Contributions are always welcome! Please feel free to submit a pull request with any scripts you've made or any updates to scripts that already exist!

## License
This project is under [MIT License](LICENSE).
