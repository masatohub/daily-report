import { calcTotalPages, calcPageItems } from "@/lib/pagination";

describe("calcTotalPages", () => {
  it("0件のとき0ページを返す", () => {
    expect(calcTotalPages(0, 10)).toBe(0);
  });

  it("total が perPage で割り切れるとき正確なページ数を返す", () => {
    expect(calcTotalPages(20, 10)).toBe(2);
    expect(calcTotalPages(30, 10)).toBe(3);
  });

  it("total が perPage で割り切れないとき切り上げのページ数を返す", () => {
    expect(calcTotalPages(25, 10)).toBe(3);
    expect(calcTotalPages(11, 10)).toBe(2);
    expect(calcTotalPages(1, 10)).toBe(1);
  });

  it("perPage が 0 のとき 0 を返す", () => {
    expect(calcTotalPages(100, 0)).toBe(0);
  });
});

describe("calcPageItems", () => {
  it("totalPages が 7 以下のとき全ページ番号を返す", () => {
    expect(calcPageItems(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(calcPageItems(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("先頭付近のとき末尾にだけ省略記号を含む", () => {
    const items = calcPageItems(1, 10);
    expect(items[0]).toBe(1);
    expect(items).toContain("ellipsis-end");
    expect(items).not.toContain("ellipsis-start");
    expect(items[items.length - 1]).toBe(10);
  });

  it("末尾付近のとき先頭にだけ省略記号を含む", () => {
    const items = calcPageItems(10, 10);
    expect(items[0]).toBe(1);
    expect(items).toContain("ellipsis-start");
    expect(items).not.toContain("ellipsis-end");
    expect(items[items.length - 1]).toBe(10);
  });

  it("中間ページのとき両側に省略記号を含む", () => {
    const items = calcPageItems(5, 10);
    expect(items[0]).toBe(1);
    expect(items).toContain("ellipsis-start");
    expect(items).toContain("ellipsis-end");
    expect(items[items.length - 1]).toBe(10);
  });

  it("currentPage の前後 2 ページが省略されずに表示される", () => {
    const items = calcPageItems(5, 10);
    const numbers = items.filter((i) => typeof i === "number") as number[];
    expect(numbers).toContain(3);
    expect(numbers).toContain(4);
    expect(numbers).toContain(5);
    expect(numbers).toContain(6);
    expect(numbers).toContain(7);
  });

  it("先頭ページの省略記号は currentPage が 5 以上のとき出る", () => {
    // page=4: left = max(2, 4-2) = 2, 2 > 2 は false なので省略なし
    const noEllipsis = calcPageItems(4, 10);
    expect(noEllipsis).not.toContain("ellipsis-start");

    // page=5: left = max(2, 5-2) = 3, 3 > 2 は true なので省略あり
    const withEllipsis = calcPageItems(5, 10);
    expect(withEllipsis).toContain("ellipsis-start");
  });
});
