"use client";

import { FormEvent, useState } from "react";
import {
  useCreateProperty,
  useDeleteProperty,
  useUpdateProperty,
} from "@/src/lib/hooks/useProperties";

type PropertyFormData = {
  title: string;
  type: string;
  price: string;
  location: string;
  status: string;
};

type CreatedProperty = {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  status: string;
};

const initialFormData: PropertyFormData = {
  title: "",
  type: "",
  price: "",
  location: "",
  status: "disponible",
};

export default function PropiedadesPage() {
  const createPropertyMutation = useCreateProperty();
  const updatePropertyMutation = useUpdateProperty();
  const deletePropertyMutation = useDeleteProperty();
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [createdProperties, setCreatedProperties] = useState<CreatedProperty[]>(
    [],
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState<PropertyFormData | null>(
    null,
  );

  const startEdit = (property: CreatedProperty) => {
    setEditingPropertyId(property.id);
    setEditFormData({
      title: property.title,
      type: property.type,
      price: String(property.price),
      location: property.location,
      status: property.status,
    });
    setErrorMessage(null);
  };

  const cancelEdit = () => {
    setEditingPropertyId(null);
    setEditFormData(null);
  };

  const handleSaveEdit = async (propertyId: string) => {
    if (!editFormData) return;

    setErrorMessage(null);
    try {
      const updated = await updatePropertyMutation.mutateAsync({
        id: propertyId,
        title: editFormData.title,
        type: editFormData.type,
        price: Number(editFormData.price),
        location: editFormData.location,
        status: editFormData.status,
      });

      setCreatedProperties((previous) =>
        previous.map((property) =>
          property.id === propertyId
            ? {
                ...property,
                title: updated.title,
                type: updated.type,
                price: Number(updated.price),
                location: updated.location,
                status: updated.status,
              }
            : property,
        ),
      );

      cancelEdit();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo actualizar",
      );
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    setErrorMessage(null);
    try {
      await deletePropertyMutation.mutateAsync(propertyId);
      setCreatedProperties((previous) =>
        previous.filter((property) => property.id !== propertyId),
      );
      if (editingPropertyId === propertyId) {
        cancelEdit();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo eliminar",
      );
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    try {
      const data = await createPropertyMutation.mutateAsync({
        title: formData.title,
        type: formData.type,
        price: Number(formData.price),
        location: formData.location,
        status: formData.status,
      });

      setCreatedProperties((previous) => [
        {
          id: data.id,
          title: data.title,
          type: data.type,
          price: Number(data.price),
          location: data.location,
          status: data.status,
        },
        ...previous,
      ]);
      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ocurrió un error inesperado",
      );
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2b88a1]">Propiedades</h1>
        <p className="mt-2 text-gray-600">
          Crea una nueva propiedad y revisa el listado de las ya creadas.
        </p>
        <p className="mt-2 text-gray-600">
          Este proceso es necesario para que las propiedades estén disponibles
          en el sistema y puedan ser gestionadas posteriormente.
        </p>
      </div>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">Crear propiedad</h2>
        <form
          className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
          onSubmit={handleSubmit}
        >
          <div className="md:col-span-2">
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="title"
            >
              Título
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  title: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              placeholder="Ej: Departamento en centro"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="type"
            >
              Tipo
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  type: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              required
            >
              <option value="" disabled>
                Selecciona un tipo
              </option>
              <option value="casa">Casa</option>
              <option value="departamento">Departamento</option>
              <option value="terreno">Terreno</option>
              <option value="oficina">Oficina</option>
              <option value="local">Local comercial</option>
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="status"
            >
              Estado
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  status: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              required
            >
              <option value="disponible">Disponible</option>
              <option value="reservada">Reservada</option>
              <option value="vendida">Vendida</option>
              <option value="alquilada">Alquilada</option>
            </select>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="price"
            >
              Precio
            </label>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  price: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              placeholder="Ej: 125000"
              required
            />
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium text-gray-700"
              htmlFor="location"
            >
              Ubicación
            </label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={(event) =>
                setFormData((previous) => ({
                  ...previous,
                  location: event.target.value,
                }))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2b88a1]"
              placeholder="Ej: Calle Falsa 123, Ciudad"
              required
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-between gap-3 pt-2">
            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : (
              <span className="text-sm text-gray-500">
                Completa los campos para registrar la propiedad.
              </span>
            )}

            <button
              type="submit"
              disabled={createPropertyMutation.isPending}
              className="rounded-md bg-[#2b88a1] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createPropertyMutation.isPending
                ? "Guardando..."
                : "Crear propiedad"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Propiedades creadas
          </h2>
          <span className="text-sm text-gray-500">
            {createdProperties.length} registradas
          </span>
        </div>

        {createdProperties.length === 0 ? (
          <p className="mt-4 text-sm text-gray-600">
            Aún no hay propiedades creadas en esta sesión.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Título
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Tipo
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Precio
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Ubicación
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {createdProperties.map((property) => (
                  <tr key={property.id}>
                    <td className="px-4 py-3 text-gray-800">
                      {editingPropertyId === property.id && editFormData ? (
                        <input
                          type="text"
                          value={editFormData.title}
                          onChange={(event) =>
                            setEditFormData((previous) =>
                              previous
                                ? { ...previous, title: event.target.value }
                                : previous,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1"
                        />
                      ) : (
                        property.title
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {editingPropertyId === property.id && editFormData ? (
                        <select
                          value={editFormData.type}
                          onChange={(event) =>
                            setEditFormData((previous) =>
                              previous
                                ? { ...previous, type: event.target.value }
                                : previous,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1"
                        >
                          <option value="casa">Casa</option>
                          <option value="departamento">Departamento</option>
                          <option value="terreno">Terreno</option>
                          <option value="oficina">Oficina</option>
                          <option value="local">Local comercial</option>
                        </select>
                      ) : (
                        property.type
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {editingPropertyId === property.id && editFormData ? (
                        <select
                          value={editFormData.status}
                          onChange={(event) =>
                            setEditFormData((previous) =>
                              previous
                                ? { ...previous, status: event.target.value }
                                : previous,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1"
                        >
                          <option value="disponible">Disponible</option>
                          <option value="reservada">Reservada</option>
                          <option value="vendida">Vendida</option>
                          <option value="alquilada">Alquilada</option>
                        </select>
                      ) : (
                        property.status
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {editingPropertyId === property.id && editFormData ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={editFormData.price}
                          onChange={(event) =>
                            setEditFormData((previous) =>
                              previous
                                ? { ...previous, price: event.target.value }
                                : previous,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1"
                        />
                      ) : (
                        `$${property.price.toLocaleString("es-MX")}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {editingPropertyId === property.id && editFormData ? (
                        <input
                          type="text"
                          value={editFormData.location}
                          onChange={(event) =>
                            setEditFormData((previous) =>
                              previous
                                ? { ...previous, location: event.target.value }
                                : previous,
                            )
                          }
                          className="w-full rounded-md border border-gray-300 px-2 py-1"
                        />
                      ) : (
                        property.location
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {editingPropertyId === property.id ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(property.id)}
                            disabled={updatePropertyMutation.isPending}
                            className="rounded-md bg-[#2b88a1] px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Guardar
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-md border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => startEdit(property)}
                            className="rounded-md border border-[#2b88a1] px-3 py-1 text-xs font-semibold text-[#2b88a1]"
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(property.id)}
                            disabled={deletePropertyMutation.isPending}
                            className="rounded-md border border-red-300 px-3 py-1 text-xs font-semibold text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Eliminar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
