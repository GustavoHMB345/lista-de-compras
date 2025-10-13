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
          <View style={stylesAuth.headerWrap}>
            <LinearGradient
              colors={['#6C7DFF', '#4F46E5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={stylesAuth.badge}
            >
              <Text style={stylesAuth.badgeGlyph}>{isLogin ? '🔑' : '🔐'}</Text>
            </LinearGradient>
            <Text style={stylesAuth.title}>{isLogin ? t('auth.login') : t('auth.register')}</Text>
            <Text style={stylesAuth.subtitle}>
              {isLogin
                ? (t('auth.subtitle.login') ?? 'Acesse suas listas')
                : (t('auth.subtitle.register') ?? 'Comece a organizar suas compras')}
            </Text>
          </View>
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
              testID="tab-login"
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
              testID="tab-register"
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
                      placeholderTextColor="#9CA3AF"
                      selectionColor="#2563EB"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      returnKeyType="next"
                      maxFontSizeMultiplier={1.2}
                      testID="auth-name"
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
                    placeholderTextColor="#9CA3AF"
                    selectionColor="#2563EB"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                    returnKeyType="next"
                    maxFontSizeMultiplier={1.2}
                    testID="auth-email"
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
                    placeholderTextColor="#9CA3AF"
                    selectionColor="#2563EB"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry
                    textContentType="password"
                    returnKeyType={isLogin ? 'go' : 'next'}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    maxFontSizeMultiplier={1.2}
                    testID="auth-password"
                  />
                )}
              />
              {errors.password && (
                <Text style={stylesAuth.errorField}>{errors.password.message}</Text>
              )}
              {isLogin && (
                <TouchableOpacity
                  onPress={() => router.push('/reset-password')}
                  activeOpacity={0.8}
                >
                  <View style={stylesAuth.forgotRow}>
                    <Text style={stylesAuth.forgot}>Esqueci minha senha</Text>
                  </View>
                </TouchableOpacity>
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
              testID="auth-submit"
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
              testID="auth-testuser"
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
const __fs = Math.min(1.2, Math.max(0.9, width / 390));
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
  headerWrap: { alignItems: 'center', marginBottom: 12 },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6C7DFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 8,
  },
  badgeGlyph: { fontSize: Math.round(26 * __fs), color: '#fff' },
  title: {
    fontSize: Math.round(24 * __fs),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Math.round(13 * __fs),
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
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
    fontSize: Math.round(14 * __fs),
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
    fontSize: Math.round(16 * __fs),
    color: '#111827',
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
  forgotRow: { alignItems: 'flex-end', marginTop: 6 },
  forgot: { color: '#6366F1', fontWeight: '600', fontSize: Math.round(12 * __fs) },
});
