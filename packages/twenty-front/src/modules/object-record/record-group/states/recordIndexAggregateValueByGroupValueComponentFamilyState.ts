import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { type Nullable } from 'twenty-shared/types';

export const recordIndexAggregateValueByGroupValueComponentFamilyState =
  createComponentFamilyState<Nullable<string | number>, { groupValue: string }>(
    {
      key: 'recordIndexAggregateValueByGroupValueComponentFamilyState',
      defaultValue: null,
      componentInstanceContext: ContextStoreComponentInstanceContext,
    },
  );
