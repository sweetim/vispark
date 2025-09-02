# Vispark

Vispark is a full-stack decentralized application that appears to interact with YouTube content. It consists of a React-based frontend, a Node.js backend for computation, and Ethereum smart contracts.

## Workspace

The Vispark monorepo is organized into the following packages:

| Package              | Description                                                                                                                              |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `vispark-app`        | The main frontend application built with React, Vite, and Tailwind CSS. It provides the user interface for interacting with the dApp.      |
| `vispark-compute`            | A Node.js backend service. It seems to handle tasks like fetching YouTube transcripts and other computational tasks.                       |
| `vispark-contract`   | The smart contracts for the application, developed using Hardhat and Solidity.                                                           |

---

## Getting Started

To get started with Vispark, you will need to install the dependencies and run the development servers for each package.

### Prerequisites

- [Node.js](https://nodejs.org/) (v22.x or later)
- [pnpm](https://pnpm.io/) (or your favorite package manager)

### Installation

Clone the repository and install the dependencies for each package:

```bash
git clone <repository-url>
cd vispark

# Install dependencies for each package
cd vispark-app && pnpm install
cd ../compute && pnpm install
cd ../vispark-contract && pnpm install
```

---

## Development

### `vispark-app`

To start the development server for the frontend application:

```bash
cd vispark-app
pnpm dev
```

This will start the Vite development server, and you can view the application at `http://localhost:5173`.

**Available Scripts:**

- `pnpm dev`: Starts the development server.
- `pnpm build`: Builds the application for production.
- `pnpm lint`: Lints the codebase.
- `pnpm preview`: Previews the production build.

### `compute`

To start the backend service:

```bash
cd compute
pnpm start
```

**Available Scripts:**

- `pnpm start`: Starts the backend service using `ts-node`.

### `vispark-contract`

To run the tests for the smart contracts:

```bash
cd vispark-contract
npx hardhat test
```

**Available Scripts:**

- `npx hardhat test`: Runs the test suite.
- `npx hardhat ignition deploy ignition/modules/Counter.ts`: Deploys the `Counter` contract to a local chain.
- `npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts`: Deploys the `Counter` contract to the Sepolia testnet.

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the ISC License.
