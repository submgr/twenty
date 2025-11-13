import { useRecordGroupFilter } from '@/object-record/record-group/hooks/useRecordGroupFilter';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAggregateRecordsForHeader } from '@/object-record/record-table/hooks/useAggregateRecordsForHeader';

export const useAggregateRecordsForRecordTableSection = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { recordGroupFilter } = useRecordGroupFilter(objectMetadataItem.fields);

  return useAggregateRecordsForHeader({
    objectMetadataItem,
    additionalFilters: recordGroupFilter,
  });
};
