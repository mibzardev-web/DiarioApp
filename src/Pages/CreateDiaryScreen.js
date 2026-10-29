import React from "react";

import DiaryForm from "../components/DiaryForm";
import { saveDiary } from "../storage/diaries";
import { fechaHoy } from "../utils/dates";

// `route.params.fecha` viene del calendario cuando se crea el diario de un día concreto
const CreateDiaryScreen = ({ route }) => (
  <DiaryForm
    initialValues={{ fecha: route.params?.fecha || fechaHoy() }}
    onSave={saveDiary}
    submitLabel="Guardar"
    draftKey="@borrador_nuevo"
  />
);

export default CreateDiaryScreen;
