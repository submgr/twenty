import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useRecordAggregateGqlFieldsFromRecordAggregates } from '@/object-record/record-aggregate/hooks/useRecordAggregateGqlFieldsFromRecordAggregates';
import { useRecordGroupByAggregateQuery } from '@/object-record/record-aggregate/hooks/useRecordGroupByAggregateQuery';
import { type RecordAggregate } from '@/object-record/record-aggregate/types/RecordAggregate';
import { type RecordAggregateValueByGroupValue } from '@/object-record/record-aggregate/types/RecordAggregateValueByGroupValue';
import { recordIndexAggregateValueByGroupValueComponentFamilyState } from '@/object-record/record-group/states/recordIndexAggregateValueByGroupValueComponentFamilyState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { getGroupByQueryResultGqlFieldName } from '@/page-layout/utils/getGroupByQueryResultGqlFieldName';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback, useEffect } from 'react';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexGroupByAggregateQueryEffect = ({
  recordIndexGroupFieldMetadataItem,
  recordIndexGroupRecordAggregate,
}: {
  recordIndexGroupFieldMetadataItem: FieldMetadataItem;
  recordIndexGroupRecordAggregate: RecordAggregate;
}) => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const { data, loading, error } = useRecordGroupByAggregateQuery({
    objectMetadataItem,
    groupByFieldMetadataItem: recordIndexGroupFieldMetadataItem,
    recordAggregate: recordIndexGroupRecordAggregate,
  });

  const { recordAggregateGqlFields } =
    useRecordAggregateGqlFieldsFromRecordAggregates({
      objectMetadataItem,
      recordAggregates: [recordIndexGroupRecordAggregate],
    });

  const recordIndexAggregateValueByGroupValueCallbackState =
    useRecoilComponentCallbackState(
      recordIndexAggregateValueByGroupValueComponentFamilyState,
    );

  const setRecordIndexAggregateValueByGroupValue = useRecoilCallback(
    ({ set }) =>
      (aggregateValueByGroupValueArray: RecordAggregateValueByGroupValue[]) => {
        for (const aggregateValueByGroupValue of aggregateValueByGroupValueArray) {
          set(
            recordIndexAggregateValueByGroupValueCallbackState({
              groupValue: aggregateValueByGroupValue.fieldGroupValue,
            }),
            aggregateValueByGroupValue.recordAggregateValue,
          );
        }
      },
    [recordIndexAggregateValueByGroupValueCallbackState],
  );

  type GroupByQueryResult = {
    [groupByQueryResultGqlFieldName: string]: ({
      groupByDimensionValues: string[];
    } & {
      [aggregateGqlField: string]: string | number;
    })[];
  };

  const turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue =
    useCallback(
      (queryResult: GroupByQueryResult) => {
        const recordAggregateValueByGroupValueArray: RecordAggregateValueByGroupValue[] =
          [];

        const queryResultGqlFieldName =
          getGroupByQueryResultGqlFieldName(objectMetadataItem);

        const groupByQueryResultItems = queryResult[queryResultGqlFieldName];

        for (const groupByQueryResultItem of groupByQueryResultItems) {
          if (groupByQueryResultItem.groupByDimensionValues.length === 1) {
            const groupByValue =
              groupByQueryResultItem.groupByDimensionValues[0];

            const gqlAggregateFieldName = recordAggregateGqlFields[0];

            const aggregateValue =
              groupByQueryResultItem[gqlAggregateFieldName];

            recordAggregateValueByGroupValueArray.push({
              fieldGroupValue: groupByValue,
              recordAggregateValue: aggregateValue,
            });
          }
        }

        return {
          recordAggregateValueByGroupValueArray,
        };
      },
      [objectMetadataItem, recordAggregateGqlFields],
    );

  useEffect(() => {
    if (!loading && !isDefined(error) && isDefined(data)) {
      console.log({
        data,
      });

      const { recordAggregateValueByGroupValueArray } =
        turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue(
          data,
        );

      setRecordIndexAggregateValueByGroupValue(
        recordAggregateValueByGroupValueArray,
      );

      console.log({
        recordAggregateValueByGroupValueArray,
      });
    }
  }, [
    data,
    loading,
    error,
    setRecordIndexAggregateValueByGroupValue,
    turnRecordIndexGroupByAggregateQueryResultIntoRecordAggregateValueByGroupValue,
  ]);

  return null;
};
