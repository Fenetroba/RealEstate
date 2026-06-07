'use client';

import { useMemo } from 'react';

import { useProperties } from '@/hooks/useProperties';
import { resolveDbPropertyId } from '@/lib/property-db-map';
import { useAppSelector } from '@/store/hooks';

export function useMyProperties() {
  const address = useAppSelector((s) => s.wallet.address);
  const isConnected = useAppSelector((s) => s.wallet.isConnected);

const {
    properties,   
    propertyDbMap,
    imageOverrides,
    loading,      
    refreshing,   
    chainError,   
    apiWarning,
    mockMode,
    refresh,
    writeContract,
  } = useProperties();

  const owned = useMemo(() => {
    if (!address) return [];
    const wallet = address.toLowerCase();
    return properties.filter((p) => p.owner.toLowerCase() === wallet);
  }, [properties, address]);

  const getDbPropertyId = (tokenId: string) =>
    resolveDbPropertyId(propertyDbMap, tokenId);

return {
    owned,
    propertyDbMap,
    imageOverrides,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,       
    refresh,        
    writeContract,  
    isConnected,    
    getDbPropertyId,
  };
}
