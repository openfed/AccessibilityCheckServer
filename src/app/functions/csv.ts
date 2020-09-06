import { SniffList } from "../interfaces/sniff-list";
import { uniq, forOwn } from "lodash";
import { unparse } from "papaparse";

interface RowKeyMap {
  [key: string]: {
    successCriterion: string;
    suggestedTechniques: string;
  };
}

interface RowMetadata {
  successCriterion: string;
  suggestedTechniques: string;
  errorPages: Set<string>;
  errors: number;
  warningPages: Set<string>;
  warnings: number;
  noticePages: Set<string>;
  notices: number;
  criterionErrorPages: Set<string>;
}

interface RowMap {
  [key: string]: RowMetadata;
}

interface CriterionMap {
  [key: string]: Set<string>;
}

export function sniffListToCsv(sniffList: SniffList): string {
  const headers = [
    "Success Criterion",
    "Suggested Technique(s)",
    "Error Pages",
    "Errors",
    "Warning Pages",
    "Warnings",
    "Notice Pages",
    "Notices",
    "Total Pages With Errors For Success Criterion",
    "Pages Scanned"
  ];

  const numPagesScanned = Math.max(
    ...Object.values(sniffList).map(x => Object.keys(x.items).length)
  );

  function stripHtml(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
  }

  const rowKeyValues = uniq(
    Object.values(sniffList).map(x => ({
      successCriterion: stripHtml(x.codeMessages[0][1]),
      suggestedTechniques: x.codeMessages[1]
        ? stripHtml(x.codeMessages[1][1])
        : ""
    }))
  );

  const rowKeyMap: RowKeyMap = rowKeyValues.reduce(
    (prev, cur) => ({
      ...prev,
      [JSON.stringify(cur)]: cur
    }),
    {}
  );

  const criterionMap: CriterionMap = uniq(
    rowKeyValues.map(x => x.successCriterion)
  ).reduce(
    (prev, cur) => ({
      ...prev,
      [cur]: new Set<string>()
    }),
    {}
  );

  const rowMap: RowMap = Object.keys(rowKeyMap).reduce(
    (prev, cur) => ({
      ...prev,
      [cur]: {
        successCriterion: rowKeyMap[cur].successCriterion,
        suggestedTechniques: rowKeyMap[cur].suggestedTechniques,
        errorPages: new Set<string>(),
        errors: 0,
        warningPages: new Set<string>(),
        warnings: 0,
        noticePages: new Set<string>(),
        notices: 0,
        criterionErrorPages: criterionMap[rowKeyMap[cur].successCriterion]
      }
    }),
    {} as RowMap
  );

  Object.values(sniffList).forEach(x => {
    const successCriterion = stripHtml(x.codeMessages[0][1]);
    const suggestedTechniques = x.codeMessages[1]
      ? stripHtml(x.codeMessages[1][1])
      : "";
    const rowKey = JSON.stringify({ successCriterion, suggestedTechniques });
    // populate rowMap, criterionMap
    forOwn(x.items, (results, url) => {
      results.forEach(result => {
        if (result.type === "notice") {
          rowMap[rowKey].notices++;
          rowMap[rowKey].noticePages.add(url);
        } else if (result.type === "warning") {
          rowMap[rowKey].warnings++;
          rowMap[rowKey].warningPages.add(url);
        } else if (result.type === "error") {
          rowMap[rowKey].errors++;
          rowMap[rowKey].errorPages.add(url);
          criterionMap[successCriterion].add(url);
        }
      });
    });
  });

  return unparse({
    fields: headers,
    data: Object.values(rowMap)
      .map(x => [
        x.successCriterion,
        x.suggestedTechniques,
        x.errorPages.size,
        x.errors,
        x.warningPages.size,
        x.warnings,
        x.noticePages.size,
        x.notices,
        x.criterionErrorPages.size,
        numPagesScanned
      ])
      .sort((a, b) => {
        if (a[0] === b[0]) {
          return a[1] < b[1] ? -1 : 1;
        }
        return a[0] < b[0] ? -1 : 1;
      })
  });
}
