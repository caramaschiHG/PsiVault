import { addMonths, addDays } from "date-fns";
import {
  createExpense,
  type CreateExpenseInput,
  type Expense,
  type ExpenseRecurrencePattern,
  type SeriesScope,
} from "./model";

export interface MaterializeSeriesInput extends Omit<CreateExpenseInput, "seriesId" | "seriesIndex" | "dueDate"> {
  recurrencePattern: ExpenseRecurrencePattern;
  firstOccurrenceDate: Date;
}

export interface MaterializeSeriesDeps {
  now: Date;
  createId: () => string;
  createSeriesId: () => string;
}

const OCCURRENCE_COUNT = 12;

export function materializeSeries(input: MaterializeSeriesInput, deps: MaterializeSeriesDeps): Expense[] {
  const seriesId = deps.createSeriesId();
  const occurrences: Expense[] = [];

  for (let i = 0; i < OCCURRENCE_COUNT; i++) {
    const dueDate =
      input.recurrencePattern === "MENSAL"
        ? addMonths(input.firstOccurrenceDate, i)
        : addDays(input.firstOccurrenceDate, 14 * i);

    occurrences.push(
      createExpense(
        {
          ...input,
          dueDate,
          seriesId,
          seriesIndex: i,
        },
        { now: deps.now, createId: deps.createId },
      ),
    );
  }

  return occurrences;
}

export function applySeriesEdit(
  series: Expense[],
  fromIndex: number,
  scope: SeriesScope,
  patch: Partial<Pick<Expense, "description" | "amountInCents" | "categoryId">>,
  deps: { now: Date },
): Expense[] {
  return series.map((occ) => {
    const inScope =
      scope === "all" ||
      (scope === "this" && occ.seriesIndex === fromIndex) ||
      (scope === "this_and_future" && (occ.seriesIndex ?? 0) >= fromIndex);
    return inScope ? { ...occ, ...patch, updatedAt: deps.now } : occ;
  });
}
