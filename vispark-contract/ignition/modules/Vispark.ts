import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

export default buildModule("VisparkModule", (m) => {
  const vispark = m.contract("Vispark")

  m.call(vispark, "incBy", [5n])

  return { vispark }
})
