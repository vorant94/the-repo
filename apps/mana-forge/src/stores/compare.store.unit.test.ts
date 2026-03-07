import { beforeEach, describe, expect, it } from "vitest";
import { useCompareStore } from "./compare.store.ts";

describe("useCompareStore", () => {
  beforeEach(() => {
    useCompareStore.getState().reset();
  });

  describe("addFiles", () => {
    it("adds a single file", () => {
      const file = { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" };
      useCompareStore.getState().addFiles([file]);
      expect(useCompareStore.getState().files).toEqual([file]);
    });

    it("adds multiple files at once", () => {
      const files = [
        { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" },
        { name: "file2.txt", content: "1 Counterspell (mm2) 37" },
      ];
      useCompareStore.getState().addFiles(files);
      expect(useCompareStore.getState().files).toEqual(files);
    });

    it("appends to existing files", () => {
      const file1 = {
        name: "file1.txt",
        content: "1 Lightning Bolt (m10) 149",
      };
      const file2 = { name: "file2.txt", content: "1 Counterspell (mm2) 37" };
      useCompareStore.getState().addFiles([file1]);
      useCompareStore.getState().addFiles([file2]);
      expect(useCompareStore.getState().files).toEqual([file1, file2]);
    });
  });

  describe("removeFile", () => {
    it("removes file by index", () => {
      const files = [
        { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" },
        { name: "file2.txt", content: "1 Counterspell (mm2) 37" },
      ];
      useCompareStore.getState().addFiles(files);
      useCompareStore.getState().removeFile(0);
      expect(useCompareStore.getState().files).toEqual([files[1]]);
    });

    it("removes last file", () => {
      const file = { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" };
      useCompareStore.getState().addFiles([file]);
      useCompareStore.getState().removeFile(0);
      expect(useCompareStore.getState().files).toEqual([]);
    });
  });

  describe("compare", () => {
    describe("parsing", () => {
      it("parses valid card lines", () => {
        const content = "1 Lightning Bolt (m10) 149";
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content },
          { name: "file2.txt", content },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(1);
        expect(result?.exactMatches[0]).toMatchObject({
          quantity: 1,
          name: "Lightning Bolt",
          setCode: "m10",
          collectorNumber: "149",
          foil: false,
        });
      });

      it("parses foil cards", () => {
        const content = "1 Lightning Bolt (m10) 149 *F*";
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content },
          { name: "file2.txt", content },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(1);
        expect(result?.exactMatches[0]).toMatchObject({
          foil: true,
          collectorNumber: "149",
        });
      });

      it("skips invalid lines", () => {
        const content = "invalid line\n1 Lightning Bolt (m10) 149";
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content },
          { name: "file2.txt", content },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(1);
      });
    });

    describe("exact matches", () => {
      it("finds cards in all files with same name, set, and collector number", () => {
        const content = "1 Lightning Bolt (m10) 149";
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content },
          { name: "file2.txt", content },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(1);
        expect(result?.exactMatches[0]?.name).toBe("Lightning Bolt");
      });

      it("does not match cards only in one file", () => {
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" },
          { name: "file2.txt", content: "1 Counterspell (mm2) 37" },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(0);
      });
    });

    describe("partial matches", () => {
      it("finds cards with same name but different set or collector number", () => {
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" },
          { name: "file2.txt", content: "1 Lightning Bolt (lea) 161" },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.partialMatches).toHaveLength(1);
        expect(result?.partialMatches[0]?.name).toBe("Lightning Bolt");
        expect(result?.exactMatches).toHaveLength(0);
      });

      it("does not include exact matches in partial matches", () => {
        const content = "1 Lightning Bolt (m10) 149";
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content },
          { name: "file2.txt", content },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(1);
        expect(result?.partialMatches).toHaveLength(0);
      });
    });

    describe("no matches", () => {
      it("returns empty results for cards unique to each file", () => {
        useCompareStore.getState().addFiles([
          { name: "file1.txt", content: "1 Lightning Bolt (m10) 149" },
          { name: "file2.txt", content: "1 Counterspell (mm2) 37" },
        ]);
        useCompareStore.getState().compare();
        const { result } = useCompareStore.getState();
        expect(result?.exactMatches).toHaveLength(0);
        expect(result?.partialMatches).toHaveLength(0);
      });
    });
  });

  describe("reset", () => {
    it("clears files and result", () => {
      const content = "1 Lightning Bolt (m10) 149";
      useCompareStore.getState().addFiles([
        { name: "file1.txt", content },
        { name: "file2.txt", content },
      ]);
      useCompareStore.getState().compare();
      useCompareStore.getState().reset();
      expect(useCompareStore.getState().files).toEqual([]);
      expect(useCompareStore.getState().result).toBeNull();
    });
  });
});
