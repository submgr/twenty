import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordAggregate } from '@/object-record/record-aggregate/types/RecordAggregate';
import { getAvailableAggregationsFromObjectFields } from '@/object-record/utils/getAvailableAggregationsFromObjectFields';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordAggregateGqlFieldsFromRecordAggregates = ({
  objectMetadataItem,
  recordAggregates,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordAggregates: RecordAggregate[];
}) => {
  const availableAggregations = useMemo(
    () =>
      getAvailableAggregationsFromObjectFields(
        objectMetadataItem.readableFields,
      ),
    [objectMetadataItem.readableFields],
  );

  const recordAggregateGqlFields = recordAggregates
    .map((recordAggregate) => {
      const aggregateGqlField =
        availableAggregations[recordAggregate.fieldName][
          recordAggregate.aggregateOperation
        ];

      return aggregateGqlField;
    })
    .filter(isDefined);

  return { recordAggregateGqlFields };
};
