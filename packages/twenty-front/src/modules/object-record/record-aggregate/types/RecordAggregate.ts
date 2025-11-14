import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';

export type RecordAggregate = {
  fieldName: string;
  aggregateOperation: ExtendedAggregateOperations;
};
