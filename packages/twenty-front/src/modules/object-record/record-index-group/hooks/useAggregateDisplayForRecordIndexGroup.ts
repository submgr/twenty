import { getRecordAggregateLabelWithFieldName } from '@/object-record/record-aggregate/utils/getRecordAggregateLabelWithFieldName';
import { transformAggregateRawValueIntoAggregateDisplayValue } from '@/object-record/record-aggregate/utils/transformAggregateRawValueIntoAggregateDisplayValue';
import { useCurrentRecordGroupDefinition } from '@/object-record/record-group/hooks/useCurrentRecordGroupDefinition';
import { recordIndexAggregateValueByGroupValueComponentFamilyState } from '@/object-record/record-group/states/recordIndexAggregateValueByGroupValueComponentFamilyState';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateOperationComponentState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useAggregateDisplayForRecordIndexGroup = () => {
  const recordGroupDefinition = useCurrentRecordGroupDefinition();

  const recordGroupValue = recordGroupDefinition?.value;

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);
  const dateLocale = useRecoilValue(dateLocaleState);

  const recordIndexGroupAggregateFieldMetadataItem = useRecoilComponentValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const recordIndexGroupAggregateOperation = useRecoilComponentValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  const recordIndexAggregateValueByGroupValue = useRecoilComponentFamilyValue(
    recordIndexAggregateValueByGroupValueComponentFamilyState,
    { groupValue: recordGroupValue ?? '' },
  );

  console.log({
    recordGroupDefinition,
    recordGroupValue,
    recordIndexGroupAggregateFieldMetadataItem,
    recordIndexGroupAggregateOperation,
    recordIndexAggregateValueByGroupValue,
  });

  if (
    !isDefined(recordIndexGroupAggregateFieldMetadataItem) ||
    !isDefined(recordIndexGroupAggregateOperation) ||
    !isNonEmptyString(recordGroupValue)
  ) {
    return {
      aggregateValue: '',
      aggregateLabel: '',
    };
  }

  const { labelWithFieldName } = getRecordAggregateLabelWithFieldName({
    aggregateFieldMetadataItem: recordIndexGroupAggregateFieldMetadataItem,
    aggregateOperation: recordIndexGroupAggregateOperation,
  });

  const aggregateDisplayValue =
    transformAggregateRawValueIntoAggregateDisplayValue({
      aggregateFieldMetadataItem: recordIndexGroupAggregateFieldMetadataItem,
      aggregateOperation: recordIndexGroupAggregateOperation,
      aggregateRawValue: recordIndexAggregateValueByGroupValue,
      dateFormat,
      timeFormat,
      timeZone,
      localeCatalog: dateLocale.localeCatalog,
    });

  return {
    aggregateValue: aggregateDisplayValue,
    aggregateLabel: isDefined(aggregateDisplayValue) ? labelWithFieldName : '',
  };
};
