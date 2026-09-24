// ARQUIVO TEMPORÁRIO: sobra do gerador usado durante o desenvolvimento; pode ser removido.
import { expect, it } from "vitest";
import { toCssVariables } from "./tokens.js";

it("gera variáveis CSS", () => {
  expect(toCssVariables().length).toBeGreaterThan(0);
});
