import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { useDndMonitor } from "@dnd-kit/core";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Binder } from "../stores/split.store.ts";
import { useBinderPositions } from "./use-binder-positions.ts";

vi.mock(import("@dnd-kit/core"));

describe("useBinderPositions", () => {
  beforeEach(() => {
    vi.mocked(useDndMonitor).mockClear();
  });

  describe("getPosition", () => {
    it("returns default position for unknown binder", () => {
      const containerRef = makeContainerRef();
      const { result } = renderHook(() =>
        useBinderPositions({
          binders: [],
          containerRef,
          assignmentId: "collection",
        }),
      );

      expect(result.current.getPosition("unknown")).toEqual({ x: 0, y: 0 });
    });
  });

  describe("getLayerIndex", () => {
    it("returns 0 for unknown binder", () => {
      const containerRef = makeContainerRef();
      const { result } = renderHook(() =>
        useBinderPositions({
          binders: [],
          containerRef,
          assignmentId: "collection",
        }),
      );

      expect(result.current.getLayerIndex("unknown")).toBe(0);
    });
  });

  describe("initial position assignment", () => {
    it("assigns positions to new binders on mount", () => {
      const binders = [makeBinder("b1"), makeBinder("b2")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const pos1 = result.current.getPosition("b1");
      const pos2 = result.current.getPosition("b2");

      expect(pos1).not.toEqual({ x: 0, y: 0 });
      expect(pos2).not.toEqual({ x: 0, y: 0 });
    });

    it("assigns non-overlapping positions to multiple binders", () => {
      const binders = [makeBinder("b1"), makeBinder("b2")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const pos1 = result.current.getPosition("b1");
      const pos2 = result.current.getPosition("b2");

      expect(pos1).not.toEqual(pos2);
    });
  });

  describe("bringToFront", () => {
    it("sets binder as topmost layer", () => {
      const binders = [makeBinder("b1"), makeBinder("b2")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      act(() => {
        result.current.bringToFront("b1");
      });

      const index = result.current.getLayerIndex("b1");
      expect(index).toBeGreaterThan(0);
    });

    it("moves already-tracked binder to end of order", () => {
      const binders = [makeBinder("b1"), makeBinder("b2")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      act(() => {
        result.current.bringToFront("b1");
        result.current.bringToFront("b2");
        result.current.bringToFront("b1");
      });

      const indexB1 = result.current.getLayerIndex("b1");
      const indexB2 = result.current.getLayerIndex("b2");
      expect(indexB1).toBeGreaterThan(indexB2);
    });
  });

  describe("onDragStart", () => {
    it("brings known binder to front", () => {
      const binders = [makeBinder("b1")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const { onDragStart } = getDndHandlers();
      act(() => {
        onDragStart({ active: { id: "b1" } } as unknown as DragStartEvent);
      });

      expect(result.current.getLayerIndex("b1")).toBeGreaterThan(0);
    });

    it("ignores unknown binder id", () => {
      const binders = [makeBinder("b1")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const { onDragStart } = getDndHandlers();
      act(() => {
        onDragStart({ active: { id: "unknown" } } as unknown as DragStartEvent);
      });

      expect(result.current.getLayerIndex("unknown")).toBe(0);
    });
  });

  describe("onDragEnd", () => {
    it("skips update when dropped outside assignment area", () => {
      const binders = [makeBinder("b1")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const initialPos = result.current.getPosition("b1");
      const { onDragEnd } = getDndHandlers();

      act(() => {
        onDragEnd({
          active: { id: "b1" },
          over: { id: "tradeOnly" },
          delta: { x: 50, y: 30 },
        } as unknown as DragEndEvent);
      });

      expect(result.current.getPosition("b1")).toEqual(initialPos);
    });

    it("updates position by delta for existing binder", () => {
      const binders = [makeBinder("b1")];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const initialPos = result.current.getPosition("b1");
      const { onDragEnd } = getDndHandlers();

      act(() => {
        onDragEnd({
          active: { id: "b1" },
          over: { id: "collection" },
          delta: { x: 50, y: 30 },
        } as unknown as DragEndEvent);
      });

      expect(result.current.getPosition("b1")).toEqual({
        x: initialPos.x + 50,
        y: initialPos.y + 30,
      });
    });

    it("calculates absolute position from rect for new binder", () => {
      const binders: Array<Binder> = [];
      const { current: container } = makeContainerRef();
      container.getBoundingClientRect = () =>
        ({ left: 100, top: 50 }) as DOMRect;
      const containerRef = { current: container };

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const { onDragEnd } = getDndHandlers();

      act(() => {
        onDragEnd({
          active: {
            id: "new-binder",
            rect: { current: { translated: { left: 200, top: 150 } } },
          },
          over: { id: "collection" },
          delta: { x: 0, y: 0 },
        } as unknown as DragEndEvent);
      });

      expect(result.current.getPosition("new-binder")).toEqual({
        x: 100,
        y: 100,
      });
    });

    it("skips new binder drop when no translated rect", () => {
      const binders: Array<Binder> = [];
      const containerRef = makeContainerRef();

      const { result } = renderHook(() =>
        useBinderPositions({
          binders,
          containerRef,
          assignmentId: "collection",
        }),
      );

      const { onDragEnd } = getDndHandlers();

      act(() => {
        onDragEnd({
          active: {
            id: "new-binder",
            rect: { current: { translated: null } },
          },
          over: { id: "collection" },
          delta: { x: 0, y: 0 },
        } as unknown as DragEndEvent);
      });

      expect(result.current.getPosition("new-binder")).toEqual({ x: 0, y: 0 });
    });
  });
});

function makeContainerRef(
  width = 800,
  height = 600,
): { current: HTMLDivElement } {
  const container = document.createElement("div");
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
    height,
  );
  return { current: container };
}

function makeBinder(id: string): Binder {
  return { id, name: id, binderType: "binder", cards: [], cardCount: 0 };
}

function getDndHandlers() {
  const lastCall = vi.mocked(useDndMonitor).mock.calls.at(-1);
  if (!lastCall) {
    throw new Error("useDndMonitor was not called");
  }
  const { onDragStart, onDragEnd } = lastCall[0];
  if (!onDragStart) {
    throw new Error("onDragStart not registered");
  }
  if (!onDragEnd) {
    throw new Error("onDragEnd not registered");
  }
  return { onDragStart, onDragEnd };
}
