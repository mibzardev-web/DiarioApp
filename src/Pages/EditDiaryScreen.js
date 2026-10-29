import React from "react";

import DiaryForm from "../components/DiaryForm";
import { updateDiary } from "../storage/diaries";

const EditDiaryScreen = ({ route }) => {
  const { diary } = route.params;

  return (
    <DiaryForm
      initialValues={diary}
      onSave={(form) => updateDiary(diary.id, form)}
      submitLabel="Guardar cambios"
      draftKey={`@borrador_edicion_${diary.id}`}
    />
  );
};

export default EditDiaryScreen;
