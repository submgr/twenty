import { RecordIndexGroupByAggregateQueryEffect } from '@/object-record/record-board/components/RecordIndexGroupByAggregateQueryEffect';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-group/states/recordIndexGroupFieldMetadataItemComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupAggregatesDataLoader = () => {
  const recordIndexGroupFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useRecoilComponentValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  if (
    !isDefined(recordIndexGroupFieldMetadataItem) ||
    !isDefined(recordIndexGroupAggregateFieldMetadataItem) ||
    !isDefined(recordIndexGroupAggregateOperation)
  ) {
    return null;
  }

  return (
    <RecordIndexGroupByAggregateQueryEffect
      recordIndexGroupFieldMetadataItem={recordIndexGroupFieldMetadataItem}
      recordIndexGroupRecordAggregate={{
        aggregateOperation: recordIndexGroupAggregateOperation,
        fieldName: recordIndexGroupAggregateFieldMetadataItem.name,
      }}
    />
  );
};
