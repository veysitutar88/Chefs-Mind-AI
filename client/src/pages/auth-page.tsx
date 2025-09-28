import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/components/ui/logo";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({ username: "", password: "", confirmPassword: "" });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginData);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      return;
    }
    registerMutation.mutate({
      username: registerData.username,
      password: registerData.password
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <Logo className="w-12 h-12 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Chef's Mind AI</h1>
              <p className="text-sm text-muted-foreground">Интеллектуальная Аналитическая Платформа</p>
            </div>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Вход в систему</CardTitle>
                  <CardDescription>
                    Введите ваши учетные данные для доступа к платформе
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-username">Имя пользователя</Label>
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="admin"
                        value={loginData.username}
                        onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                        required
                        data-testid="input-login-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Пароль</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                        data-testid="input-login-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                      data-testid="button-login"
                    >
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Вход...
                        </>
                      ) : (
                        "Войти"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Создать аккаунт</CardTitle>
                  <CardDescription>
                    Зарегистрируйтесь для получения доступа к Chef's Mind AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Имя пользователя</Label>
                      <Input
                        id="register-username"
                        type="text"
                        placeholder="Выберите имя пользователя"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                        required
                        data-testid="input-register-username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Пароль</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="Создайте надежный пароль"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        data-testid="input-register-password"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Подтвердите пароль</Label>
                      <Input
                        id="register-confirm-password"
                        type="password"
                        placeholder="Повторите пароль"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                        data-testid="input-register-confirm-password"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending || registerData.password !== registerData.confirmPassword}
                      data-testid="button-register"
                    >
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Регистрация...
                        </>
                      ) : (
                        "Зарегистрироваться"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="flex-1 bg-primary text-primary-foreground p-8 flex items-center justify-center">
        <div className="max-w-lg text-center">
          <h2 className="text-3xl font-bold mb-6">
            Добро пожаловать в Chef's Mind AI
          </h2>
          <div className="space-y-4 text-primary-foreground/90">
            <div className="flex items-center space-x-3">
              <i className="fas fa-robot text-2xl"></i>
              <div className="text-left">
                <h3 className="font-semibold">5 Специализированных Агентов</h3>
                <p className="text-sm">Accountant, Chef, Analyst, Visualizer, Media Studio</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-database text-2xl"></i>
              <div className="text-left">
                <h3 className="font-semibold">Безопасная База Данных</h3>
                <p className="text-sm">PostgreSQL с двойной системой безопасности</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-upload text-2xl"></i>
              <div className="text-left">
                <h3 className="font-semibold">Импорт Данных</h3>
                <p className="text-sm">CSV/XLSX файлы с автоматической обработкой</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-shield-alt text-2xl"></i>
              <div className="text-left">
                <h3 className="font-semibold">SQL Валидатор</h3>
                <p className="text-sm">Защита от опасных SQL операций</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
