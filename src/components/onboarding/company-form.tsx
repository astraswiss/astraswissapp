"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ButtonEl } from "@/components/ui/button";
import type { Address } from "@/lib/store/types";

export type CompanyFormValues = {
  name: string;
  address: Address;
  uid: string;
  iban: string;
  email: string;
  phone: string;
};

const EMPTY: CompanyFormValues = {
  name: "",
  address: { street: "", houseNumber: "", postalCode: "", city: "", country: "CH" },
  uid: "",
  iban: "",
  email: "",
  phone: "",
};

export function CompanyForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: Partial<CompanyFormValues>;
  submitLabel: string;
  onSubmit: (values: CompanyFormValues) => void;
}) {
  const [values, setValues] = useState<CompanyFormValues>({
    ...EMPTY,
    ...initialValues,
    address: { ...EMPTY.address, ...initialValues?.address },
  });

  function set<K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function setAddress<K extends keyof Address>(key: K, value: Address[K]) {
    setValues((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">Firmenname</label>
        <Input
          required
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          placeholder="Müller Sanitär GmbH"
        />
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Strasse</label>
          <Input
            required
            value={values.address.street}
            onChange={(event) => setAddress("street", event.target.value)}
            placeholder="Bahnhofstrasse"
          />
        </div>
        <div className="flex w-24 flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Nr.</label>
          <Input
            required
            value={values.address.houseNumber}
            onChange={(event) => setAddress("houseNumber", event.target.value)}
            placeholder="12"
          />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr_auto] gap-3">
        <div className="flex w-24 flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">PLZ</label>
          <Input
            required
            value={values.address.postalCode}
            onChange={(event) => setAddress("postalCode", event.target.value)}
            placeholder="8000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Ort</label>
          <Input
            required
            value={values.address.city}
            onChange={(event) => setAddress("city", event.target.value)}
            placeholder="Zürich"
          />
        </div>
        <div className="flex w-28 flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Land</label>
          <Select
            value={values.address.country}
            onChange={(event) => setAddress("country", event.target.value)}
          >
            <option value="CH">Schweiz</option>
            <option value="LI">Liechtenstein</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">UID / MWST-Nummer (optional)</label>
        <Input
          value={values.uid}
          onChange={(event) => set("uid", event.target.value)}
          placeholder="CHE-123.456.789 MWST"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-ink">IBAN / QR-IBAN</label>
        <Input
          required
          value={values.iban}
          onChange={(event) => set("iban", event.target.value.toUpperCase())}
          placeholder="CH44 3199 9123 0008 9012"
          className="font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">E-Mail</label>
          <Input
            required
            type="email"
            value={values.email}
            onChange={(event) => set("email", event.target.value)}
            placeholder="kontakt@firma.ch"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-ink">Telefon (optional)</label>
          <Input
            value={values.phone}
            onChange={(event) => set("phone", event.target.value)}
            placeholder="044 123 45 67"
          />
        </div>
      </div>

      <ButtonEl type="submit" className="mt-2 self-start">
        {submitLabel}
      </ButtonEl>
    </form>
  );
}
