import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listClasses, createClass, getClassRoster } from '@/services/class.service';
import { getClassSubjects } from '@/services/assignment.service';
import { COLORS } from '@/constants/colors';
import type { ClassInfo } from '@/types/user.types';

/**
 * Class row with subject count + student count fetched inline.
 */
function ClassRow({ cls }: { cls: ClassInfo }) {
  const subjectsQuery = useQuery({
    queryKey: ['classSubjects', cls.classId],
    queryFn: () => getClassSubjects(cls.classId),
  });

  const rosterQuery = useQuery({
    queryKey: ['classRoster', cls.classId],
    queryFn: () => getClassRoster(cls.classId),
  });

  const subjectCount = subjectsQuery.data?.items.length;
  const studentCount = rosterQuery.data?.items.length;

  return (
    <Link href={`/(admin)/classes/${cls.classId}`} asChild>
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={styles.classIcon}>
          <Ionicons name="school" size={22} color={COLORS.primary[600]} />
        </View>
        <View style={styles.rowContent}>
          <Text style={styles.className}>{cls.name} {cls.section}</Text>
          <View style={styles.rowMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={13} color={COLORS.text.tertiary} />
              <Text style={styles.metaText}>
                {subjectCount !== undefined ? `${subjectCount} subjects` : '…'}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={13} color={COLORS.text.tertiary} />
              <Text style={styles.metaText}>
                {studentCount !== undefined ? `${studentCount} students` : '…'}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.text.tertiary} />
      </TouchableOpacity>
    </Link>
  );
}

export default function ClassesListScreen() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [section, setSection] = useState('');

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses(),
  });

  const createMutation = useMutation({
    mutationFn: () => createClass({ name: name.trim(), section: section.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] });
      setName('');
      setSection('');
      setShowCreate(false);
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to create class');
    },
  });

  const classes = data?.items || [];

  return (
    <View style={styles.container}>
      <FlatList
        data={classes}
        keyExtractor={(item) => item.classId}
        renderItem={({ item }) => <ClassRow cls={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        ListHeaderComponent={
          showCreate ? (
            <View style={styles.createCard}>
              <Text style={styles.createTitle}>New Class</Text>
              <TextInput
                style={styles.input}
                placeholder="Class name (e.g. Class 10)"
                placeholderTextColor={COLORS.text.tertiary}
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Section (e.g. A)"
                placeholderTextColor={COLORS.text.tertiary}
                value={section}
                onChangeText={setSection}
              />
              <View style={styles.createActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowCreate(false)}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, (!name.trim() || !section.trim()) && styles.saveBtnDisabled]}
                  onPress={() => createMutation.mutate()}
                  disabled={!name.trim() || !section.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary[600]} style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="school-outline" size={48} color={COLORS.text.tertiary} />
              <Text style={styles.emptyText}>No classes yet</Text>
              <Text style={styles.emptyHint}>Tap + to create the first class</Text>
            </View>
          )
        }
      />

      {/* FAB */}
      {!showCreate && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowCreate(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={26} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  list: { padding: 12, paddingBottom: 100, gap: 8 },
  row: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContent: { flex: 1, gap: 4 },
  className: { fontSize: 15, fontWeight: '600', color: COLORS.text.primary },
  rowMeta: { flexDirection: 'row', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.text.secondary },
  createCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.primary[200],
  },
  createTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary },
  input: {
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text.primary,
  },
  createActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 4 },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelText: { color: COLORS.text.secondary, fontSize: 14, fontWeight: '500' },
  saveBtn: {
    backgroundColor: COLORS.primary[600],
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveBtnDisabled: { opacity: 0.4 },
  saveText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.text.secondary },
  emptyHint: { fontSize: 13, color: COLORS.text.tertiary },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
