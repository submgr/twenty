import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { generateGroupByAggregateQuery } from '@/object-record/utils/generateGroupByAggregateQuery';

export const useRecordIndexGroupAggregates = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const groupByAggregateQuery = generateGroupByAggregateQuery({
    aggregateOperations: [],
    objectMetadataItem,
  });
};
