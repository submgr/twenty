import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getAggregateOperationLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationLabel';
import { getAggregateOperationShortLabel } from '@/object-record/record-board/record-board-column/utils/getAggregateOperationShortLabel';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { t } from '@lingui/core/macro';
import { AggregateOperations } from '~/generated-metadata/graphql';

export const getRecordAggregateLabelWithFieldName = ({
  aggregateFieldMetadataItem,
  aggregateOperation,
}: {
  aggregateFieldMetadataItem: FieldMetadataItem;
  aggregateOperation: ExtendedAggregateOperations;
}) => {
  const aggregateLabel = t(getAggregateOperationShortLabel(aggregateOperation));
  const fieldLabel = aggregateFieldMetadataItem.label;
  const labelWithFieldName =
    aggregateOperation === AggregateOperations.COUNT
      ? `${getAggregateOperationLabel(AggregateOperations.COUNT)}`
      : t`${aggregateLabel} of ${fieldLabel}`;

  return {
    labelWithFieldName,
  };
};
