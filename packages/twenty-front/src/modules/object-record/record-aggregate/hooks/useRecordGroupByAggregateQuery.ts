import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useRecordAggregateGqlFieldsFromRecordAggregates } from '@/object-record/record-aggregate/hooks/useRecordAggregateGqlFieldsFromRecordAggregates';
import { type RecordAggregate } from '@/object-record/record-aggregate/types/RecordAggregate';
import { generateGroupByAggregateQuery } from '@/object-record/record-aggregate/utils/generateGroupByAggregateQuery';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { buildGroupByFieldObject } from '@/page-layout/widgets/graph/utils/buildGroupByFieldObject';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { UserContext } from '@/users/contexts/UserContext';
import { useQuery } from '@apollo/client';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import {
  computeRecordGqlOperationFilter,
  isDefined,
  turnAnyFieldFilterIntoRecordGqlFilter,
} from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const useRecordGroupByAggregateQuery = ({
  objectMetadataItem,
  skip,
  groupByFieldMetadataItem,
  recordAggregate,
}: {
  skip?: boolean;
  objectMetadataItem: ObjectMetadataItem;
  groupByFieldMetadataItem: FieldMetadataItem;
  recordAggregate: RecordAggregate;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const currentRecordFilterGroups = useRecoilComponentValue(
    currentRecordFilterGroupsComponentState,
  );

  const currentRecordFilters = useRecoilComponentValue(
    currentRecordFiltersComponentState,
  );

  const dateLocale = useRecoilValue(dateLocaleState);

  const { filterValueDependencies } = useFilterValueDependencies();

  const { dateFormat, timeFormat, timeZone } = useContext(UserContext);

  const requestFilters = computeRecordGqlOperationFilter({
    filterValueDependencies,
    recordFilters: currentRecordFilters,
    recordFilterGroups: currentRecordFilterGroups,
    fields: objectMetadataItem.fields,
  });

  const { recordAggregateGqlFields } =
    useRecordAggregateGqlFieldsFromRecordAggregates({
      objectMetadataItem,
      recordAggregates: [recordAggregate],
    });

  const groupByAggregateQuery = generateGroupByAggregateQuery({
    aggregateOperationGqlFields: recordAggregateGqlFields,
    objectMetadataItem,
  });

  const anyFieldFilterValue = useRecoilComponentValue(
    anyFieldFilterValueComponentState,
  );

  const { recordGqlOperationFilter: anyFieldFilter } =
    turnAnyFieldFilterIntoRecordGqlFilter({
      fields: objectMetadataItem.fields,
      filterValue: anyFieldFilterValue,
    });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const groupByGqlInput = buildGroupByFieldObject({
    field: groupByFieldMetadataItem,
  });

  const { data, loading, error } = useQuery(groupByAggregateQuery, {
    skip: !isDefined(objectMetadataItem) || !hasReadPermission || skip,
    variables: {
      filter: { ...requestFilters, ...anyFieldFilter },
      groupBy: {
        ...groupByGqlInput,
      },
    },
    client: apolloCoreClient,
  });

  console.log({
    recordAggregateGqlFields,
    data,
    loading,
    error,
  });

  return {
    data,
    loading,
    error,
  };
};
