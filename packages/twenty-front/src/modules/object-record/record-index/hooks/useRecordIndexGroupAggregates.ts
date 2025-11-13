import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { buildRecordGqlFieldsAggregateForView } from '@/object-record/record-board/record-board-column/utils/buildRecordGqlFieldsAggregateForView';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { generateGroupByAggregateQuery } from '@/object-record/utils/generateGroupByAggregateQuery';
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

export const useRecordIndexGroupAggregates = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();
  const apolloCoreClient = useApolloCoreClient();

  const recordIndexKanbanAggregateOperation = useRecoilValue(
    recordIndexKanbanAggregateOperationState,
  );

  const aggregateOperations = isDefined(
    recordIndexKanbanAggregateOperation?.operation,
  )
    ? [recordIndexKanbanAggregateOperation.operation]
    : [];

  const groupByAggregateQuery = generateGroupByAggregateQuery({
    aggregateOperations,
    objectMetadataItem,
  });

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

  const recordGqlFieldsAggregate = buildRecordGqlFieldsAggregateForView({
    objectMetadataItem,
    recordIndexKanbanAggregateOperation,
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

  const { data, loading, error } = useQuery<RecordGqlOperationFindManyResult>(
    groupByAggregateQuery,
    {
      skip: !isDefined(objectMetadataItem) || !hasReadPermission,
      variables: {
        filter: { ...requestFilters, ...anyFieldFilter },
      },
      client: apolloCoreClient,
    },
  );

  console.log({
    data,
    loading,
    error,
  });

  return {
    data,
  };
};
