import { formatEnum } from "../../utils/format";

describe("formatEnum", () => {
    it("should convert an uppercase enum value to a formatted string", () => {
        expect(formatEnum("HELLO_WORLD"))
            .toBe("Hello World");
    });

    it("should handle lowercase input correctly", () => {
        expect(formatEnum("hello_world"))
            .toBe("Hello World");
    });

    it("should handle mixed case input correctly", () => {
        expect(formatEnum("HeLLo_WorLD"))
            .toBe("Hello World");
    });

    it("should handle single word inputs", () => {
        expect(formatEnum("SINGLE"))
            .toBe("Single");
    });

    it("should handle multiple underscores correctly", () => {
        expect(formatEnum("MULTIPLE_UNDERSCORES_TEST"))
            .toBe("Multiple Underscores Test");
    });

    it("should handle already formatted inputs correctly", () => {
        expect(formatEnum("Already Formatted"))
            .toBe("Already Formatted");
    });
});