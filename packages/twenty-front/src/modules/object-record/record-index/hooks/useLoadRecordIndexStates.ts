import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { useGetFieldMetadataItemByIdOrThrow } from '@/object-metadata/hooks/useGetFieldMetadataItemById';
import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { availableFieldMetadataItemsForSortFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForSortFamilySelector';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useSetRecordGroups } from '@/object-record/record-group/hooks/useSetRecordGroups';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-group/states/recordIndexGroupAggregateOperationComponentState';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-group/states/recordIndexGroupFieldMetadataItemComponentState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordIndexFieldDefinitionsState } from '@/object-record/record-index/states/recordIndexFieldDefinitionsState';
import { recordIndexKanbanAggregateOperationState } from '@/object-record/record-index/states/recordIndexKanbanAggregateOperationState';
import { recordIndexKanbanFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexKanbanFieldMetadataIdState';
import { recordIndexOpenRecordInState } from '@/object-record/record-index/states/recordIndexOpenRecordInState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { filterAvailableTableColumns } from '@/object-record/utils/filterAvailableTableColumns';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type View } from '@/views/types/View';
import { type ViewField } from '@/views/types/ViewField';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLoadRecordIndexStates = () => {
  const setContextStoreTargetedRecordsRuleComponentState =
    useSetRecoilComponentState(contextStoreTargetedRecordsRuleComponentState);

  const setRecordIndexViewType = useSetRecoilState(recordIndexViewTypeState);
  const setRecordIndexOpenRecordIn = useSetRecoilState(
    recordIndexOpenRecordInState,
  );
  const setRecordIndexViewKanbanFieldMetadataIdState = useSetRecoilState(
    recordIndexKanbanFieldMetadataIdState,
  );

  const setRecordIndexGroupFieldMetadataItem = useSetRecoilComponentState(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const setRecordIndexGroupAggregateOperation = useSetRecoilComponentState(
    recordIndexGroupAggregateOperationComponentState,
  );

  const setRecordIndexGroupAggregateFieldMetadataItem =
    useSetRecoilComponentState(
      recordIndexGroupAggregateFieldMetadataItemComponentState,
    );

  const setRecordIndexCalendarFieldMetadataIdState = useSetRecoilState(
    recordIndexCalendarFieldMetadataIdState,
  );
  const setRecordIndexViewKanbanAggregateOperationState = useSetRecoilState(
    recordIndexKanbanAggregateOperationState,
  );

  const { getFieldMetadataItemByIdOrThrow } =
    useGetFieldMetadataItemByIdOrThrow();

  const { setRecordGroupsFromViewGroups } = useSetRecordGroups();

  const onViewFieldsChange = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewFields: ViewField[], objectMetadataItem: ObjectMetadataItem) => {
        const activeFieldMetadataItems = objectMetadataItem.fields.filter(
          ({ isActive, isSystem }) => isActive && !isSystem,
        );

        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        const sortableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForSortFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        const columnDefinitions: ColumnDefinition<FieldMetadata>[] =
          activeFieldMetadataItems
            .map((field, index) =>
              formatFieldMetadataItemAsColumnDefinition({
                position: index,
                field,
                objectMetadataItem,
              }),
            )
            .filter(filterAvailableTableColumns)
            .map((column) => {
              const existsInFilterDefinitions =
                filterableFieldMetadataItems.some(
                  (fieldMetadataItem) =>
                    fieldMetadataItem.id === column.fieldMetadataId,
                );

              const existsInSortDefinitions = sortableFieldMetadataItems.some(
                (fieldMetadataItem) =>
                  fieldMetadataItem.id === column.fieldMetadataId,
              );

              return {
                ...column,
                isFilterable: existsInFilterDefinitions,
                isSortable: existsInSortDefinitions,
              };
            });

        const newFieldDefinitions = mapViewFieldsToColumnDefinitions({
          viewFields,
          columnDefinitions,
        });

        const existingRecordIndexFieldDefinitions = snapshot
          .getLoadable(recordIndexFieldDefinitionsState)
          .getValue();

        if (
          !isDeeplyEqual(
            existingRecordIndexFieldDefinitions,
            newFieldDefinitions,
          )
        ) {
          set(recordIndexFieldDefinitionsState, newFieldDefinitions);
        }

        for (const viewField of viewFields) {
          const viewFieldMetadataType = objectMetadataItem.fields?.find(
            (field) => field.id === viewField.fieldMetadataId,
          )?.type;

          const aggregateOperationForViewField = snapshot
            .getLoadable(
              viewFieldAggregateOperationState({
                viewFieldId: viewField.id,
              }),
            )
            .getValue();
          const convertedViewFieldAggregateOperation = isDefined(
            viewField.aggregateOperation,
          )
            ? convertAggregateOperationToExtendedAggregateOperation(
                viewField.aggregateOperation,
                viewFieldMetadataType,
              )
            : viewField.aggregateOperation;

          if (
            aggregateOperationForViewField !==
            convertedViewFieldAggregateOperation
          ) {
            set(
              viewFieldAggregateOperationState({
                viewFieldId: viewField.id,
              }),
              convertedViewFieldAggregateOperation,
            );
          }
        }
      },
    [],
  );

  const loadRecordIndexStates = useRecoilCallback(
    ({ snapshot }) =>
      async (view: View, objectMetadataItem: ObjectMetadataItem) => {
        const filterableFieldMetadataItems = snapshot
          .getLoadable(
            availableFieldMetadataItemsForFilterFamilySelector({
              objectMetadataItemId: objectMetadataItem.id,
            }),
          )
          .getValue();

        onViewFieldsChange(view.viewFields, objectMetadataItem);

        setRecordGroupsFromViewGroups(
          view.id,
          view.viewGroups,
          objectMetadataItem,
        );

        setContextStoreTargetedRecordsRuleComponentState((prev) => ({
          ...prev,
          filters: mapViewFiltersToFilters(
            view.viewFilters,
            filterableFieldMetadataItems,
          ),
        }));

        setRecordIndexViewType(view.type);
        setRecordIndexOpenRecordIn(view.openRecordIn);
        setRecordIndexViewKanbanFieldMetadataIdState(
          view.viewGroups?.[0]?.fieldMetadataId,
        );

        const recordIndexGroupFieldMetadataItemId =
          view.viewGroups?.[0]?.fieldMetadataId;

        if (isNonEmptyString(recordIndexGroupFieldMetadataItemId)) {
          const { fieldMetadataItem: recordIndexGroupFieldMetadataItem } =
            getFieldMetadataItemByIdOrThrow(
              recordIndexGroupFieldMetadataItemId,
            );

          setRecordIndexGroupFieldMetadataItem(
            recordIndexGroupFieldMetadataItem,
          );
        }

        setRecordIndexCalendarFieldMetadataIdState(
          view.calendarFieldMetadataId ?? null,
        );

        const recordIndexGroupAggregateFieldMetadataItemId =
          view.kanbanAggregateOperationFieldMetadataId;

        if (isNonEmptyString(recordIndexGroupAggregateFieldMetadataItemId)) {
          const {
            fieldMetadataItem: recordIndexGroupAggregateFieldMetadataItem,
          } = getFieldMetadataItemByIdOrThrow(
            recordIndexGroupAggregateFieldMetadataItemId,
          );

          setRecordIndexGroupAggregateFieldMetadataItem(
            recordIndexGroupAggregateFieldMetadataItem,
          );

          const recordIndexGroupAggregateOperation =
            view.kanbanAggregateOperation;

          if (isNonEmptyString(recordIndexGroupAggregateOperation)) {
            const recordIndexGroupAggregateExtendedOperation =
              convertAggregateOperationToExtendedAggregateOperation(
                recordIndexGroupAggregateOperation,
                recordIndexGroupAggregateFieldMetadataItem.type,
              );

            setRecordIndexViewKanbanAggregateOperationState({
              operation: isDefined(view.kanbanAggregateOperation)
                ? recordIndexGroupAggregateExtendedOperation
                : view.kanbanAggregateOperation,
              fieldMetadataId: view.kanbanAggregateOperationFieldMetadataId,
            });

            setRecordIndexGroupAggregateOperation(
              recordIndexGroupAggregateExtendedOperation,
            );
          }
        }
      },
    [
      onViewFieldsChange,
      setRecordGroupsFromViewGroups,
      setContextStoreTargetedRecordsRuleComponentState,
      setRecordIndexViewType,
      setRecordIndexOpenRecordIn,
      setRecordIndexViewKanbanFieldMetadataIdState,
      setRecordIndexCalendarFieldMetadataIdState,
      setRecordIndexViewKanbanAggregateOperationState,
      getFieldMetadataItemByIdOrThrow,
      setRecordIndexGroupFieldMetadataItem,
      setRecordIndexGroupAggregateOperation,
      setRecordIndexGroupAggregateFieldMetadataItem,
    ],
  );

  return {
    loadRecordIndexStates,
  };
};
