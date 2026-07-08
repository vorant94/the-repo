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

  describe("similarity", () => {
    const compareContents = (...contents: Array<string>) => {
      useCompareStore
        .getState()
        .addFiles(
          contents.map((content, i) => ({ name: `f${i}.txt`, content })),
        );
      useCompareStore.getState().compare();
      return useCompareStore.getState().result;
    };

    it("is zero when fewer than two decks are compared", () => {
      const result = compareContents("4 Brainstorm");
      expect(result?.similarity).toBe(0);
      expect(result?.similarityWithoutBasicLands).toBe(0);
    });

    it("is zero when the decks contain no valid cards", () => {
      const result = compareContents("not a card", "also not a card");
      expect(result?.similarity).toBe(0);
    });

    it("is 100 for identical decks", () => {
      const result = compareContents(
        "4 Brainstorm\n1 Island",
        "4 Brainstorm\n1 Island",
      );
      expect(result?.similarity).toBe(100);
    });

    it("is zero for decks with no shared card names", () => {
      const result = compareContents("2 Brainstorm", "2 Counterspell");
      expect(result?.similarity).toBe(0);
    });

    it("counts all copies of a shared card, regardless of quantity or version", () => {
      // Brainstorm shared (3 + 1 copies = 4), Forest / Mountain unique.
      // matched = 4, total = 6 => 66.67%.
      const result = compareContents(
        "3 Brainstorm\n1 Forest",
        "1 Brainstorm (a) 1\n1 Mountain",
      );
      expect(result?.similarity).toBeCloseTo((4 / 6) * 100, 5);
    });

    it("excludes basic lands from the without-basic-lands score", () => {
      // With basics: Brainstorm shared (2+2), Forest only in deck A =>
      // matched 4 / total 6. Without basics: only Brainstorm remains => 100%.
      const result = compareContents("2 Brainstorm\n2 Forest", "2 Brainstorm");
      expect(result?.similarity).toBeCloseTo((4 / 6) * 100, 5);
      expect(result?.similarityWithoutBasicLands).toBe(100);
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
