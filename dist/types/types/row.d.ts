export interface IRow {
    isSelected: boolean;
    index: number;
    startIndex: number;
    endIndex: number;
    value: string;
    selectionStart: number;
    selectionEnd: number;
}
export declare const getRows: (el: HTMLTextAreaElement) => IRow[];
//# sourceMappingURL=row.d.ts.map