/**
 * 'Add Sleep Entry' form, presented in a bottom sheet.
 *
 * @format
 */

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../theme';
import BottomSheet from './BottomSheet';
import PrimaryButton from './PrimaryButton';
import SheetInput from './SheetInput';

export type AddEntryValues = {
  date: string;
  sleepTime: string;
  wakeTime: string;
  notes: string;
};

type AddEntrySheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Return false to keep the sheet open — the values did not parse. */
  onSubmit: (values: AddEntryValues) => boolean;
  /** Prefilled date, 'YYYY-MM-DD'. */
  defaultDate: string;
};

const emptyValues = (date: string): AddEntryValues => ({
  date,
  sleepTime: '',
  wakeTime: '',
  notes: '',
});

function AddEntrySheet({
  visible,
  onClose,
  onSubmit,
  defaultDate,
}: AddEntrySheetProps) {
  const [values, setValues] = useState(() => emptyValues(defaultDate));
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof AddEntryValues) => (text: string) =>
    setValues(current => ({ ...current, [key]: text }));

  const dismiss = () => {
    setValues(emptyValues(defaultDate));
    setError(null);
    onClose();
  };

  const submit = () => {
    if (onSubmit(values)) {
      dismiss();
      return;
    }

    setError('Check the date and times — try 9:10 pm and 4:55 am.');
  };

  const canSubmit =
    values.date.trim() !== '' &&
    values.sleepTime.trim() !== '' &&
    values.wakeTime.trim() !== '';

  return (
    <BottomSheet onClose={dismiss} title="Add Sleep Entry" visible={visible}>
      <View style={styles.fields}>
        <SheetInput
          accented
          autoCapitalize="none"
          label="Date"
          onChangeText={update('date')}
          placeholder="2026-08-11"
          value={values.date}
        />
        <View style={styles.row}>
          <SheetInput
            autoCapitalize="none"
            containerStyle={styles.rowField}
            label="Sleep time"
            onChangeText={update('sleepTime')}
            placeholder="9:10 pm"
            value={values.sleepTime}
          />
          <SheetInput
            autoCapitalize="none"
            containerStyle={styles.rowField}
            label="Wake time"
            onChangeText={update('wakeTime')}
            placeholder="4:55 am"
            value={values.wakeTime}
          />
        </View>
        <SheetInput
          label="Notes (optional)"
          multiline
          onChangeText={update('notes')}
          placeholder="Woke up twice, room a little warm"
          value={values.notes}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton disabled={!canSubmit} label="Save entry" onPress={submit} />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  fields: {
    gap: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  rowField: {
    flex: 1,
  },
  error: {
    ...typography.bodySmall,
    color: colors.primary,
  },
});

export default AddEntrySheet;
