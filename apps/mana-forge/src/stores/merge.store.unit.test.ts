import { beforeEach, describe, expect, it } from "vitest";
import { useMergeStore } from "./merge.store.ts";

describe("useMergeStore", () => {
  beforeEach(() => {
    useMergeStore.getState().reset();
  });

  describe("addFiles", () => {
    it("adds a single file", () => {
      const file = { name: "deck.txt", content: "1 Lightning Bolt (m10) 149" };
      useMergeStore.getState().addFiles([file]);
      expect(useMergeStore.getState().files).toEqual([file]);
    });

    it("appends to existing files", () => {
      const file1 = {
        name: "deck-a.txt",
        content: "1 Lightning Bolt (m10) 149",
      };
      const file2 = { name: "deck-b.txt", content: "1 Counterspell (mm2) 37" };
      useMergeStore.getState().addFiles([file1]);
      useMergeStore.getState().addFiles([file2]);
      expect(useMergeStore.getState().files).toEqual([file1, file2]);
    });
  });

  describe("removeFile", () => {
    it("removes file by index", () => {
      const files = [
        { name: "deck-a.txt", content: "1 Lightning Bolt (m10) 149" },
        { name: "deck-b.txt", content: "1 Counterspell (mm2) 37" },
      ];
      useMergeStore.getState().addFiles(files);
      useMergeStore.getState().removeFile(0);
      expect(useMergeStore.getState().files).toEqual([files[1]]);
    });
  });

  describe("merge", () => {
    it("takes max quantity when same card name appears in multiple files", () => {
      useMergeStore.getState().addFiles([
        { name: "deck-a.txt", content: "3 Counterspell (2ed) 84" },
        { name: "deck-b.txt", content: "2 Counterspell (lea) 54" },
      ]);
      useMergeStore.getState().merge();

      const { result } = useMergeStore.getState();
      expect(result?.cards).toHaveLength(1);
      expect(result?.cards[0]).toMatchObject({
        name: "Counterspell",
        quantity: 3,
      });
    });

    it("returns cards from a single file unchanged", () => {
      useMergeStore.getState().addFiles([
        {
          name: "deck.txt",
          content: "3 Counterspell (2ed) 84\n2 Lightning Bolt (m10) 149",
        },
      ]);
      useMergeStore.getState().merge();

      const { result } = useMergeStore.getState();
      expect(result?.cards).toHaveLength(2);
      expect(result?.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Counterspell", quantity: 3 }),
          expect.objectContaining({ name: "Lightning Bolt", quantity: 2 }),
        ]),
      );
    });

    it("produces union of all cards when files have no overlap", () => {
      useMergeStore.getState().addFiles([
        { name: "deck-a.txt", content: "3 Counterspell (2ed) 84" },
        { name: "deck-b.txt", content: "4 Lightning Bolt (m10) 149" },
      ]);
      useMergeStore.getState().merge();

      const { result } = useMergeStore.getState();
      expect(result?.cards).toHaveLength(2);
      expect(result?.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Counterspell", quantity: 3 }),
          expect.objectContaining({ name: "Lightning Bolt", quantity: 4 }),
        ]),
      );
    });

    it("takes correct max across three files with mixed overlap", () => {
      useMergeStore.getState().addFiles([
        {
          name: "deck-a.txt",
          content: "4 Counterspell (2ed) 84\n2 Lightning Bolt (m10) 149",
        },
        {
          name: "deck-b.txt",
          content: "2 Counterspell (lea) 54\n3 Lightning Bolt (m10) 149",
        },
        {
          name: "deck-c.txt",
          content: "1 Counterspell (mm2) 37\n1 Dark Ritual (lea) 74",
        },
      ]);
      useMergeStore.getState().merge();

      const { result } = useMergeStore.getState();
      expect(result?.cards).toHaveLength(3);
      expect(result?.cards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: "Counterspell", quantity: 4 }),
          expect.objectContaining({ name: "Lightning Bolt", quantity: 3 }),
          expect.objectContaining({ name: "Dark Ritual", quantity: 1 }),
        ]),
      );
    });

    it("sorts result alphabetically by card name", () => {
      useMergeStore.getState().addFiles([
        {
          name: "deck.txt",
          content:
            "2 Lightning Bolt (m10) 149\n1 Counterspell (2ed) 84\n3 Dark Ritual (lea) 74",
        },
      ]);
      useMergeStore.getState().merge();

      const names = useMergeStore.getState().result?.cards.map((c) => c.name);
      expect(names).toEqual(["Counterspell", "Dark Ritual", "Lightning Bolt"]);
    });
  });

  describe("reset", () => {
    it("clears files and result", () => {
      useMergeStore
        .getState()
        .addFiles([
          { name: "deck.txt", content: "1 Lightning Bolt (m10) 149" },
        ]);
      useMergeStore.getState().merge();
      useMergeStore.getState().reset();

      expect(useMergeStore.getState().files).toEqual([]);
      expect(useMergeStore.getState().result).toBeNull();
    });
  });
});
