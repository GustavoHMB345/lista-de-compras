import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';
import Button from '../components/Button';
import Chip from '../components/Chip';
import Screen from '../components/Screen';
import { DataContext } from '../contexts/DataContext';
import { t } from '../i18n';

export default function AuthScreen() {
  const { login, register } = useContext(DataContext);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  const loginSchema = useMemo(
    () =>
      z.object({
        email: z.string().email('Email inválido'),
        password: z.string().min(6, 'Mínimo de 6 caracteres'),
      }),
    [],
  );
  const registerSchema = useMemo(
    () =>
      loginSchema.extend({
        name: z.string().min(2, 'Informe seu nome'),
      }),
    [loginSchema],
  );

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isLogin ? loginSchema : registerSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onBlur',
  });

  const onSubmit = async (values) => {
    setError('');
    if (isLogin) {
      const result = await login(values.email, values.password);
      if (result?.success) {
        router.replace('/dashboard');
        return;
      }
      setError(result?.message || 'Email ou senha inválidos.');
    } else {
      const result = await register(values.email, values.password, values.name);
      if (result?.success) {
        router.replace('/dashboard');
        return;
      }
      setError(result?.message || 'Não foi possível cadastrar.');
    }
  };

  return (
    <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={stylesAuth.gradient}>
      <Screen>
        <View style={stylesAuth.card}>
          <View style={stylesAuth.tabContainer} accessibilityRole="tablist">
            <Chip
              label={t('auth.login')}
              active={isLogin}
              onPress={() => {
                setIsLogin(true);
                setError('');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isLogin }}
              style={stylesAuth.tab}
            />
            <Chip
              label={t('auth.register')}
              active={!isLogin}
              onPress={() => {
                setIsLogin(false);
                setError('');
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: !isLogin }}
              style={stylesAuth.tab}
            />
          </View>
          <View style={stylesAuth.formArea}>
            {!isLogin && (
              <View style={stylesAuth.inputBox}>
                <Text style={stylesAuth.label}>{t('auth.name')}</Text>
                <Controller
                  control={control}
                  name="name"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[stylesAuth.input, errors.name && stylesAuth.inputError]}
                      placeholder={t('auth.placeholder.name')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  )}
                />
                {errors.name && <Text style={stylesAuth.errorField}>{errors.name.message}</Text>}
              </View>
            )}
            <View style={stylesAuth.inputBox}>
              <Text style={stylesAuth.label}>{t('auth.email')}</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[stylesAuth.input, errors.email && stylesAuth.inputError]}
                    placeholder={t('auth.placeholder.email')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                  />
                )}
              />
              {errors.email && <Text style={stylesAuth.errorField}>{errors.email.message}</Text>}
            </View>
            <View style={stylesAuth.inputBox}>
              <Text style={stylesAuth.label}>{t('auth.password')}</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[stylesAuth.input, errors.password && stylesAuth.inputError]}
                    placeholder={t('auth.placeholder.password')}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    textContentType="password"
                    returnKeyType={isLogin ? 'go' : 'next'}
                    onSubmitEditing={handleSubmit(onSubmit)}
                  />
                )}
              />
              {errors.password && (
                <Text style={stylesAuth.errorField}>{errors.password.message}</Text>
              )}
            </View>
            {!!error && (
              <View style={stylesAuth.errorBox}>
                <Text style={stylesAuth.errorText}>{error}</Text>
              </View>
            )}
            <Button
              title={isLogin ? t('auth.login') : t('auth.register')}
              onPress={handleSubmit(onSubmit)}
              style={{ width: '100%' }}
              loading={isSubmitting}
              disabled={isSubmitting}
            />
            <Button
              variant="secondary"
              title={t('auth.testUser')}
              onPress={async () => {
                setError('');
                setValue('email', 'teste@teste.com');
                setValue('password', '123456');
                const result = await login('teste@teste.com', '123456');
                if (result.success) {
                  router.replace('/dashboard');
                } else {
                  setError(t('auth.error.testUserNotFound'));
                }
              }}
              style={{ width: '100%', marginTop: 0 }}
            />
            <TouchableOpacity
              onPress={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              activeOpacity={0.7}
            >
              <Text style={stylesAuth.toggleText}>
                {isLogin ? t('auth.toggle.toRegister') : t('auth.toggle.toLogin')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Screen>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');
const stylesAuth = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: width > 420 ? 380 : '92%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 10,
    elevation: 7,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  formArea: {
    marginTop: 18,
  },
  inputBox: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    fontSize: 16,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  errorText: {
    color: '#B91C1C',
    textAlign: 'center',
    fontSize: 14,
  },
  errorField: { color: '#B91C1C', fontSize: 12, marginTop: 4 },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  button: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 4,
    minHeight: 44,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleText: {
    marginTop: 12,
    color: '#6366F1',
    fontWeight: '500',
    textAlign: 'center',
  },
});
