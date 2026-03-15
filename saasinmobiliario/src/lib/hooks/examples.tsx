/**
 * EJEMPLOS DE USO DE TANSTACK QUERY
 *
 * Este archivo contiene ejemplos de cómo usar los hooks personalizados
 * con TanStack Query para gestionar organizaciones.
 */

"use client";

import {
  useOrganization,
  useOrganizationByClerkId,
  useOrganizations,
  useCreateOrganization,
  useUpdateOrganization,
  useUpdateOrganizationPlan,
  useAddUserToOrganization,
  useDeleteOrganization,
} from "@/src/lib/hooks/useOrganizations";

// ========== EJEMPLO 1: Obtener una organización por ID ==========
export function OrganizationDetail({ orgId }: { orgId: string }) {
  const { data, isLoading, error } = useOrganization(orgId);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No se encontró la organización</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>Plan: {data.plan}</p>
      <p>Estado: {data.plan_status}</p>
      <p>Usuarios: {data._count?.users || 0}</p>
      <p>Propiedades: {data._count?.properties || 0}</p>
      <p>Leads: {data._count?.leads || 0}</p>
    </div>
  );
}

// ========== EJEMPLO 2: Obtener organización por Clerk ID ==========
export function OrganizationByClerk({ clerkOrgId }: { clerkOrgId: string }) {
  const { data, isLoading } = useOrganizationByClerkId(clerkOrgId);

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>ID: {data?.id}</p>
    </div>
  );
}

// ========== EJEMPLO 3: Listar todas las organizaciones ==========
export function OrganizationsList() {
  const { data, isLoading, error } = useOrganizations(1, 20);

  if (isLoading) return <div>Cargando organizaciones...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Organizaciones ({data?.total})</h2>
      <ul>
        {data?.organizations.map((org) => (
          <li key={org.id}>
            {org.name} - {org.plan} - {org.plan_status}
          </li>
        ))}
      </ul>
      <p>
        Página {data?.page} de {data?.totalPages}
      </p>
    </div>
  );
}

// ========== EJEMPLO 4: Crear una nueva organización ==========
export function CreateOrganizationForm() {
  const createOrganization = useCreateOrganization();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createOrganization.mutateAsync({
        name: formData.get("name") as string,
        plan: formData.get("plan") as string,
        clerkUserId: "user_xxx", // Obtener del contexto de Clerk
      });
    } catch (error) {
      console.error("Error al crear:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Nombre de la organización" required />
      <select name="plan" required>
        <option value="basic">Básico</option>
        <option value="pro">Pro</option>
        <option value="enterprise">Empresarial</option>
      </select>
      <button type="submit" disabled={createOrganization.isPending}>
        {createOrganization.isPending ? "Creando..." : "Crear Organización"}
      </button>
      {createOrganization.isError && (
        <p>Error: {createOrganization.error.message}</p>
      )}
    </form>
  );
}

// ========== EJEMPLO 5: Actualizar organización ==========
export function UpdateOrganizationForm({ orgId }: { orgId: string }) {
  const updateOrganization = useUpdateOrganization();

  const handleUpdate = async (name: string) => {
    try {
      await updateOrganization.mutateAsync({
        organizationId: orgId,
        name,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button
        onClick={() => handleUpdate("Nuevo Nombre")}
        disabled={updateOrganization.isPending}
      >
        {updateOrganization.isPending ? "Actualizando..." : "Actualizar Nombre"}
      </button>
    </div>
  );
}

// ========== EJEMPLO 6: Actualizar plan ==========
export function UpgradePlanButton({ orgId }: { orgId: string }) {
  const updatePlan = useUpdateOrganizationPlan();

  const handleUpgrade = async () => {
    try {
      await updatePlan.mutateAsync({
        organizationId: orgId,
        plan: "pro",
        planStatus: "active",
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button onClick={handleUpgrade} disabled={updatePlan.isPending}>
      {updatePlan.isPending ? "Actualizando..." : "Actualizar a Pro"}
    </button>
  );
}

// ========== EJEMPLO 7: Agregar usuario a organización ==========
export function AddUserButton({
  orgId,
  userId,
}: {
  orgId: string;
  userId: string;
}) {
  const addUser = useAddUserToOrganization();

  const handleAddUser = async () => {
    try {
      await addUser.mutateAsync({
        organizationId: orgId,
        clerkUserId: userId,
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button onClick={handleAddUser} disabled={addUser.isPending}>
      {addUser.isPending ? "Agregando..." : "Agregar Usuario"}
    </button>
  );
}

// ========== EJEMPLO 8: Eliminar organización ==========
export function DeleteOrganizationButton({ orgId }: { orgId: string }) {
  const deleteOrg = useDeleteOrganization();

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta organización?")) return;

    try {
      await deleteOrg.mutateAsync(orgId);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <button onClick={handleDelete} disabled={deleteOrg.isPending}>
      {deleteOrg.isPending ? "Eliminando..." : "Eliminar Organización"}
    </button>
  );
}

// ========== EJEMPLO 9: Uso con optimistic updates ==========
export function OptimisticUpdateExample({ orgId }: { orgId: string }) {
  const { data } = useOrganization(orgId);
  const updateOrganization = useUpdateOrganization();

  // El hook ya maneja la invalidación automática del cache
  // Los datos se actualizarán automáticamente después de la mutación

  return (
    <div>
      <h3>{data?.name}</h3>
      <button
        onClick={() => {
          updateOrganization.mutate({
            organizationId: orgId,
            name: "Nuevo Nombre",
          });
        }}
      >
        Actualizar
      </button>
    </div>
  );
}
