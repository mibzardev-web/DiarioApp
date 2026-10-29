import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useTheme } from "../store/theme";
import {
  getStudents,
  addStudent,
  renameStudent,
  deleteStudent,
} from "../storage/students";

const AlumnosScreen = ({ navigation }) => {
  const Palette = useTheme();
  const styles = useMemo(() => makeStyles(Palette), [Palette]);

  const [students, setStudents] = useState([]);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState(null); // { id, nombre } | null
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => setStudents(await getStudents()), []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const onAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    if (students.some((s) => s.nombre.toLowerCase() === name.toLowerCase())) {
      Alert.alert("Ya existe", `Ya tienes a ${name} en tu lista.`);
      return;
    }
    await addStudent(name);
    setNewName("");
    load();
  };

  const onSaveEdit = async () => {
    const name = editName.trim();
    if (!name) return;
    await renameStudent(editing.id, name);
    setEditing(null);
    load();
  };

  const confirmDelete = (student) => {
    Alert.alert(
      "Quitar alumno",
      `¿Quitar a ${student.nombre} de la lista? Sus menciones en los diarios no se borran.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Quitar",
          style: "destructive",
          onPress: async () => {
            await deleteStudent(student.id);
            load();
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={students}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View>
            <Text style={styles.help}>
              Da de alta a tu grupo. Al escribir un diario podrás tocar sus
              nombres para insertarlos, y aquí verás todo lo que se ha escrito
              de cada uno.
            </Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Nombre del alumno"
                placeholderTextColor={Palette.muted}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={onAdd}
              />
              <TouchableOpacity
                style={[styles.addBtn, !newName.trim() && styles.addBtnDisabled]}
                onPress={onAdd}
                disabled={!newName.trim()}
              >
                <MaterialCommunityIcons name="plus" size={26} color="#FFF" />
              </TouchableOpacity>
            </View>
            <View style={styles.countRow}>
              <MaterialCommunityIcons name="account-group" size={20} color={Palette.dark} />
              <Text style={styles.countText}>
                {students.length} {students.length === 1 ? "alumno" : "alumnos"}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="account-multiple-plus-outline" size={56} color={Palette.border} />
            <Text style={styles.emptyTitle}>Aún no hay alumnos</Text>
            <Text style={styles.empty}>Escribe un nombre arriba y toca + para agregarlo.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("StudentDetailScreen", { student: item })}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.nombre.charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {item.nombre}
            </Text>
            <TouchableOpacity
              style={[styles.actionBtn, styles.editBtn]}
              onPress={() => {
                setEditing(item);
                setEditName(item.nombre);
              }}
            >
              <MaterialCommunityIcons name="pencil-outline" size={20} color={Palette.dark} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.deleteBtn]}
              onPress={() => confirmDelete(item)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={20} color={Palette.danger} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={!!editing}
        transparent
        animationType="fade"
        onRequestClose={() => setEditing(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar nombre</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              autoCapitalize="words"
              onSubmitEditing={onSaveEdit}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setEditing(null)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={onSaveEdit}>
                <Text style={styles.modalSaveText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const makeStyles = (Palette) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: Palette.background },
    list: { padding: 16, paddingBottom: 30 },
    help: { fontSize: 13, color: Palette.subText, marginBottom: 14 },
    addRow: { flexDirection: "row", gap: 10 },
    input: {
      flex: 1,
      backgroundColor: "#FFF",
      borderWidth: 1,
      borderColor: Palette.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      color: Palette.text,
    },
    addBtn: {
      backgroundColor: Palette.primary,
      width: 48,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    addBtnDisabled: { opacity: 0.5 },
    countRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 20,
      marginBottom: 10,
    },
    countText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
      color: Palette.dark,
    },
    emptyBox: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
    emptyTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 16,
      color: Palette.text,
      marginTop: 8,
    },
    empty: { color: Palette.muted, textAlign: "center", marginTop: 4 },
    card: {
      backgroundColor: "#FFF",
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      elevation: 2,
    },
    avatar: {
      backgroundColor: Palette.tint,
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 18,
      color: Palette.primary,
    },
    name: {
      flex: 1,
      fontFamily: "Poppins_600SemiBold",
      fontSize: 15,
      color: Palette.dark,
    },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    editBtn: { backgroundColor: Palette.tint },
    deleteBtn: { backgroundColor: Palette.dangerBg },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "center",
      padding: 24,
    },
    modalBox: { backgroundColor: "#FFF", borderRadius: 18, padding: 18, gap: 12 },
    modalTitle: {
      fontFamily: "Poppins_600SemiBold",
      fontSize: 17,
      color: Palette.dark,
    },
    modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10 },
    modalCancel: { paddingVertical: 10, paddingHorizontal: 16 },
    modalCancelText: { color: Palette.subText, fontSize: 15 },
    modalSave: {
      backgroundColor: Palette.primary,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
    },
    modalSaveText: { color: "#FFF", fontFamily: "Poppins_600SemiBold", fontSize: 15 },
  });

export default AlumnosScreen;
