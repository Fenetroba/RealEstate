'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Compass, FilePlus, Home, Loader2, RefreshCw, Wallet } from 'lucide-react';

import { DashboardEmptyState } from '@/components/dashboard/DashboardEmptyState';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { MyPropertiesList } from '@/components/my-properties/MyPropertiesList';
import { UpdateRequestModal } from '@/components/my-properties/UpdateRequestModal';
import { VersionHistoryModal } from '@/components/my-properties/VersionHistoryModal';
import { Button } from '@/components/ui/Button';
import { useMyProperties } from '@/hooks/useMyProperties';
import { useSubmitPropertyUpdate } from '@/hooks/useSubmitPropertyUpdate';
import { useWeb3 } from '@/contexts/Web3Context';
import { registryPropertyToUpdateForm } from '@/lib/property-update';
import { registryNftsPageDescription } from '@/lib/constants/dashboard-portfolio';
import { dashboardSectionStackClass } from '@/lib/constants/dashboard-layout';
import type { PropertyUpdateFormState } from '@/lib/property-update';
import type { RegistryProperty } from '@/types/registry-property';

function MyPropertiesConnectGate() {
  const { connect } = useWeb3();
  return (
    <div className="rounded-2xl border border-border bg-card p-8 sm:p-10">
      <div className="mx-auto max-w-md text-center">
        <Wallet className="mx-auto mb-4 size-10 text-muted" aria-hidden />
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Connect your wallet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Owned properties are read from the registry by wallet address. Connect to see NFTs you
          hold and request metadata updates.
        </p>
        <div className="mt-6 flex justify-center">
          <Button variant="primary" onClick={() => void connect()}>Connect Wallet</Button>
        </div>
      </div>
    </div>
  );
}

export default function MyPropertiesPage() {
  const { contract } = useWeb3();
  const {
    owned,
    loading,
    refreshing,
    chainError,
    apiWarning,
    mockMode,
    refresh,
    writeContract,
    isConnected,
    getDbPropertyId,
  } = useMyProperties();

  const { submit, loading: submitLoading, fieldError, setFieldError } =
    useSubmitPropertyUpdate(contract);

  const [updateProperty, setUpdateProperty] = useState<RegistryProperty | null>(null);
  const [updateForm, setUpdateForm] = useState<PropertyUpdateFormState | null>(null);
  const [updateImages, setUpdateImages] = useState<File[]>([]);
  const [updateDocs, setUpdateDocs] = useState<File[]>([]);
  const [versionTokenId, setVersionTokenId] = useState<string | null>(null);
  const [versionPropertyName, setVersionPropertyName] = useState<string | undefined>();

  const openUpdate = useCallback((property: RegistryProperty) => {
    setUpdateProperty(property);
    setUpdateForm(registryPropertyToUpdateForm(property));
    setUpdateImages([]);
    setUpdateDocs([]);
    setFieldError(null);
  }, [setFieldError]);

  const closeUpdate = useCallback(() => {
    setUpdateProperty(null);
    setUpdateForm(null);
    setUpdateImages([]);
    setUpdateDocs([]);
    setFieldError(null);
  }, [setFieldError]);

  const handleUpdateSubmit = useCallback(async () => {
    if (!updateProperty || !updateForm) return;
    const ok = await submit({
      tokenId: updateProperty.id,
      dbPropertyId: getDbPropertyId(updateProperty.id),
      form: updateForm,
      images: updateImages,
      documents: updateDocs,
    });
    if (ok) {
      closeUpdate();
      void refresh();
    }
  }, [
    updateProperty,
    updateForm,
    updateImages,
    updateDocs,
    submit,
    getDbPropertyId,
    closeUpdate,
    refresh,
  ]);

  const openVersions = useCallback((property: RegistryProperty) => {
    setVersionTokenId(property.id);
    setVersionPropertyName(property.name);
  }, []);

  return (
    <DashboardShell>
      <div className={dashboardSectionStackClass}>
        <DashboardHeader
          title="Registry NFTs"
          description={registryNftsPageDescription}
          actions={
            isConnected ? (
              <div className="flex flex-wrap gap-2">
                <Link href="/dashboard/listings">
                  <Button variant="outline" size="sm">
                    Marketplace listings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={
                    refreshing || loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )
                  }
                  onClick={() => void refresh()}
                  disabled={loading || refreshing}
                >
                  Refresh
                </Button>
              </div>
            ) : null
          }
        />

        {mockMode && isConnected ? (
          <p className="-mt-4 text-xs text-muted">
            Demo mode — sample owned NFTs for your wallet. Live updates need the registry API and
            contract.
          </p>
        ) : null}

        {apiWarning && isConnected ? (
          <p className="rounded-lg border border-border bg-surface px-4 py-3 text-sm text-muted">
            {apiWarning}
          </p>
        ) : null}

        {!isConnected ? (
          <MyPropertiesConnectGate />
        ) : (
          <>
            {chainError ? (
              <div
                className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                role="alert"
              >
                {chainError}
              </div>
            ) : null}

            {/* Purchased / recently acquired banner */}
            {!loading && owned.length > 0 && (
              <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 dark:border-green-800 dark:bg-green-950/30">
                <p className="mb-2 font-semibold text-green-800 dark:text-green-300">
                  🎉 You own {owned.length} registered propert{owned.length === 1 ? 'y' : 'ies'}
                </p>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  <li>• <strong>List for sale</strong> — go to a property detail page and click "List for sale"</li>
                  <li>• <strong>List for rent</strong> — click "List for rent" on any property you own</li>
                  <li>• <strong>Request update</strong> — use the "Submit update" button below to update metadata</li>
                  <li>• <strong>View history</strong> — click "Version history" to see all metadata versions on-chain</li>
                </ul>
              </div>
            )}

            {loading && owned.length === 0 && !chainError ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted">
                <Loader2 className="size-5 animate-spin" aria-hidden />
                Loading your properties…
              </div>
            ) : owned.length === 0 && !loading ? (
              <DashboardEmptyState
                icon={Home}
                title="You don't own any properties yet"
                description="Mint a property through registration, or acquire one from the marketplace after it is approved."
                action={
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href="/dashboard/listings/create">
                      <Button variant="primary" leftIcon={<FilePlus className="size-4" />}>
                        Submit registration
                      </Button>
                    </Link>
                    <Link href="/properties">
                      <Button variant="outline" leftIcon={<Compass className="size-4" />}>
                        Browse properties
                      </Button>
                    </Link>
                  </div>
                }
              />
            ) : (
              <MyPropertiesList
                properties={owned}
                getDbPropertyId={getDbPropertyId}
                writeContract={writeContract}
                onSubmitUpdate={openUpdate}
                onVersionHistory={openVersions}
                onRefresh={refresh}
              />
            )}
          </>
        )}

        {updateProperty && updateForm ? (
          <UpdateRequestModal
            isOpen
            property={updateProperty}
            form={updateForm}
            images={updateImages}
            documents={updateDocs}
            loading={submitLoading}
            fieldError={fieldError}
            dbMissing={!getDbPropertyId(updateProperty.id)}
            onClose={closeUpdate}
            onFormChange={(patch) =>
              setUpdateForm((prev) => (prev ? { ...prev, ...patch } : prev))
            }
            onImagesChange={setUpdateImages}
            onDocumentsChange={setUpdateDocs}
            onSubmit={() => void handleUpdateSubmit()}
          />
        ) : null}

        <VersionHistoryModal
          isOpen={Boolean(versionTokenId)}
          tokenId={versionTokenId}
          propertyName={versionPropertyName}
          writeContract={writeContract}
          onClose={() => {
            setVersionTokenId(null);
            setVersionPropertyName(undefined);
          }}
        />
      </div>
    </DashboardShell>
  );
}
