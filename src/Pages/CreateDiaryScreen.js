import React from "react";

import DiaryForm from "../components/DiaryForm";
import { saveDiary } from "../storage/diaries";
import { fechaHoy } from "../utils/dates";

const CreateDiaryScreen = () => (
  <DiaryForm
    initialValues={{ fecha: fechaHoy() }}
    onSave={saveDiary}
    submitLabel="Guardar"
  />
);

export default CreateDiaryScreen;
