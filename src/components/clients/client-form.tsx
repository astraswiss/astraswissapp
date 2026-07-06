"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ButtonEl } from "@/components/ui/button";
import type { Address } from "@/lib/store/types";
import type { ClientInput } from "@/lib/store/clients";

const EMPTY_ADDRESS: Address = { street: "", houseNumber: "", postalCode: "", city: "", country: "CH" };

export function ClientForm({
  initialValues,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initialValues?: Partial<ClientInput>;
  submitLabel: string;
  onSubmit: (values: ClientInput) => void;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<ClientInput>({
    name: initialValues?.name ?? "",
    address: { ...EMPTY_ADDRESS, ...initialValues?.address },
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
  });

  function set<K extends keyof ClientInput>(key: K, value: ClientInput[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setAddress<K extends keyof Address>(key: K, value: Address[K]) {
    setValues((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Name</label>
        <Input
          required
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Müller Sanitär GmbH"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Strasse</label>
          <Input
            value={values.address.street}
            onChange={(event) => setAddress("street", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:w-24">
          <label className="text-sm font-medium text-ink">Nr.</label>
          <Input
            value={values.address.houseNumber}
            onChange={(event) => setAddress("houseNumber", event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-1.5 sm:w-24">
          <label className="text-sm font-medium text-ink">PLZ</label>
          <Input
            value={values.address.postalCode}
            onChange={(event) => setAddress("postalCode", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Ort</label>
          <Input
            value={values.address.city}
            onChange={(event) => setAddress("city", event.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">E-Mail (optional)</label>
          <Input
            type="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Telefon (optional)</label>
          <Input value={values.phone} onChange={(event) => set("phone", event.target.value)} />
        </div>
      </div>

      <div className="flex gap-3">
        <ButtonEl type="submit">{submitLabel}</ButtonEl>
        {onCancel && (
          <ButtonEl type="button" variant="secondary" onClick={onCancel}>
            Abbrechen
          </ButtonEl>
        )}
      </div>
    </form>
  );
}
