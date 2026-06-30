import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTeacher } from '@/services/user.service';
import { listClasses } from '@/services/class.service';
import { SUBJECTS, SUBJECT_LABELS, type Subject } from '@/constants/subjects';
import { SubjectPill } from '@/components/ui/SubjectPill';
import { COLORS } from '@/constants/colors';
import type { CreateTeacherPayload } from '@/types/user.types';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Assignment {
  classId: string;
  className: string;
  subject: Subject;
}

export default function CreateTeacherScreen() {
  const queryClient = useQueryClient();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const classesQuery = useQuery({
    queryKey: ['classes'],
    queryFn: () => listClasses(),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateTeacherPayload) => createTeacher(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      Alert.alert(
        'Teacher Created',
        `${result.message}\n\nTemporary password: ${result.tempPassword}`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (err: any) => {
      Alert.alert('Error', err.message || 'Failed to create teacher');
    },
  });

  const addAssignment = () => {
    if (!selectedClassId || !selectedSubject) return;
    const exists = assignments.some(
      (a) => a.classId === selectedClassId && a.subject === selectedSubject
    );
    if (exists) return;

    const cls = classesQuery.data?.items.find((c) => c.classId === selectedClassId);
    setAssignments((prev) => [
      ...prev,
      {
        classId: selectedClassId,
        className: cls ? `${cls.name} ${cls.section}` : selectedClassId,
        subject: selectedSubject as Subject,
      },
    ]);
    setSelectedSubject('');
  };

  const removeAssignment = (index: number) => {
    setAssignments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    mutation.mutate({
      ...data,
      assignments: assignments.map((a) => ({
        classId: a.classId,
        subject: a.subject,
      })),
    });
  };

  const classes = classesQuery.data?.items || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <Text style={styles.heading}>New Teacher</Text>

      {/* Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name *</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Full name"
              placeholderTextColor={COLORS.text.tertiary}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
      </View>

      {/* Email */}
      <View style={styles.field}>
        <Text style={styles.label}>Email *</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="teacher@example.com"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      {/* Phone */}
      <View style={styles.field}>
        <Text style={styles.label}>Phone</Text>
        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              placeholderTextColor={COLORS.text.tertiary}
              keyboardType="phone-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
        />
      </View>

      {/* Assignment Builder */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Class Assignments</Text>

        {/* Class picker */}
        <Text style={styles.label}>Select Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.classId}
              style={[styles.chip, selectedClassId === cls.classId && styles.chipActive]}
              onPress={() => setSelectedClassId(cls.classId)}
            >
              <Text style={[
                styles.chipText,
                selectedClassId === cls.classId && styles.chipTextActive,
              ]}>
                {cls.name} {cls.section}
              </Text>
            </TouchableOpacity>
          ))}
          {classes.length === 0 && (
            <Text style={styles.hint}>No classes created yet</Text>
          )}
        </ScrollView>

        {/* Subject picker */}
        {selectedClassId ? (
          <>
            <Text style={[styles.label, { marginTop: 12 }]}>Select Subject</Text>
            <View style={styles.subjectGrid}>
              {SUBJECTS.map((sub) => (
                <TouchableOpacity
                  key={sub}
                  style={[styles.chip, selectedSubject === sub && styles.chipActive]}
                  onPress={() => setSelectedSubject(sub)}
                >
                  <Text style={[
                    styles.chipText,
                    selectedSubject === sub && styles.chipTextActive,
                  ]}>
                    {SUBJECT_LABELS[sub]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.addBtn, (!selectedSubject) && styles.addBtnDisabled]}
              onPress={addAssignment}
              disabled={!selectedSubject}
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add Assignment</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {/* Added assignments list */}
        {assignments.length > 0 && (
          <View style={styles.assignmentsList}>
            {assignments.map((a, i) => (
              <View key={`${a.classId}-${a.subject}`} style={styles.assignmentRow}>
                <View style={styles.assignmentInfo}>
                  <Text style={styles.assignmentClass}>{a.className}</Text>
                  <SubjectPill subject={a.subject} size="sm" />
                </View>
                <TouchableOpacity onPress={() => removeAssignment(i)}>
                  <Ionicons name="close-circle" size={22} color={COLORS.error.main} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, mutation.isPending && styles.submitDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={mutation.isPending}
        activeOpacity={0.8}
      >
        {mutation.isPending ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.submitText}>Create Teacher</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.secondary },
  scroll: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: '700', color: COLORS.text.primary, marginBottom: 20 },
  field: { marginBottom: 16, gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text.secondary },
  input: {
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text.primary,
  },
  inputError: { borderColor: COLORS.error.main },
  error: { fontSize: 12, color: COLORS.error.main },
  section: { marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 12 },
  chipRow: { flexDirection: 'row', marginBottom: 4 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.tertiary,
    marginRight: 6,
    marginBottom: 6,
  },
  chipActive: { backgroundColor: COLORS.primary[600] },
  chipText: { fontSize: 13, fontWeight: '500', color: COLORS.text.secondary },
  chipTextActive: { color: '#FFFFFF' },
  hint: { fontSize: 13, color: COLORS.text.tertiary, fontStyle: 'italic' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary[500],
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  addBtnDisabled: { opacity: 0.4 },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  assignmentsList: { gap: 8 },
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.primary,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  assignmentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  assignmentClass: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  submitBtn: {
    backgroundColor: COLORS.primary[600],
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: COLORS.primary[600],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
