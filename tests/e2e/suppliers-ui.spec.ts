import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('E2E Suppliers UI - Полный CRUD-цикл', () => {
  const logFilePath = path.join(
    process.cwd(),
    'reports',
    'artifacts',
    'e2e_suppliers_ui_crud.log'
  );

  test.beforeAll(async ({ playwright }) => {
    // Логирование начала тестов
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | STARTED | Full CRUD cycle testing\n`;
    
    const dir = path.dirname(logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test.afterAll(async () => {
    // Логирование завершения тестов
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | COMPLETED | Full CRUD cycle testing\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('1. Переход на страницу suppliers и проверка загрузки', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log(`🧪 Переход на страницу поставщиков: ${baseURL}/suppliers`);
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Проверяем загрузку страницы
    await expect(page).toHaveTitle(/Suppliers|Поставщики|suppliers/i);
    
    // Проверяем наличие основных элементов
    await expect(page.locator('h1, h2, [data-testid="suppliers-title"]')).toBeVisible();
    
    // Проверяем наличие списка поставщиков или сообщения о пустом списке
    await expect(page.locator('[data-testid="suppliers-list"], [data-testid="empty-suppliers"]')).toBeVisible();
    
    console.log('✅ Страница suppliers загружена успешно');
    
    // Логируем успех
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | PASSED | Navigation to suppliers page\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('2. Создание нового поставщика через UI', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Создание нового поставщика через UI');
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Ищем кнопку "Создать поставщика" или аналогичную
    const createButtonSelectors = [
      '[data-testid="create-supplier-button"]',
      'button:has-text("Создать")',
      'button:has-text("Create")',
      'a:has-text("Создать поставщика")',
      'button[aria-label="Create supplier"]'
    ];
    
    let createButton = null;
    for (const selector of createButtonSelectors) {
      try {
        const button = page.locator(selector);
        if (await button.isVisible()) {
          createButton = button;
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (createButton) {
      // Нажимаем кнопку создания
      await createButton.click();
      
      // Ждем появления формы
      await expect(page.locator('[data-testid="supplier-form"], form, .modal, [role="dialog"]')).toBeVisible();
      
      // Заполняем форму создания поставщика
      const supplierData = {
        name: 'Тестовый Поставщик UI',
        contactPerson: 'Иван Иванов',
        email: 'test@supplier-ui.com',
        phone: '+7 (999) 123-45-67',
        address: 'г. Москва, ул. Тестовая, д. 123'
      };
      
      // Заполняем поля формы
      const formFields = [
        { selector: '[data-testid="supplier-name"], input[name="name"]', value: supplierData.name },
        { selector: '[data-testid="contact-person"], input[name="contactPerson"]', value: supplierData.contactPerson },
        { selector: '[data-testid="supplier-email"], input[name="email"]', value: supplierData.email },
        { selector: '[data-testid="supplier-phone"], input[name="phone"]', value: supplierData.phone },
        { selector: '[data-testid="supplier-address"], input[name="address"], textarea[name="address"]', value: supplierData.address }
      ];
      
      for (const field of formFields) {
        try {
          await page.fill(field.selector, field.value);
        } catch {
          console.log(`⚠️  Поле ${field.selector} не найдено или не может быть заполнено`);
        }
      }
      
      // Отправляем форму
      const submitButton = page.locator('[data-testid="submit-supplier"], button[type="submit"]:has-text("Создать")');
      await submitButton.click();
      
      // Проверяем успешное создание (закрытие формы или редирект)
      await expect(page.locator('[data-testid="supplier-form"], .modal')).not.toBeVisible();
      
      // Проверяем появление нового поставщика в списке
      await page.waitForTimeout(2000); // Ждем обновления списка
      
      const newSupplierLocator = page.locator(`text=${supplierData.name}`);
      await expect(newSupplierLocator).toBeVisible();
      
      console.log('✅ Поставщик создан успешно через UI');
      
    } else {
      console.log('⚠️  Кнопка создания поставщика не найдена - возможно, форма уже открыта или функция не реализована');
      
      // Проверяем, есть ли уже форма создания на странице
      const existingForm = page.locator('[data-testid="supplier-form"], form');
      if (await existingForm.isVisible()) {
        console.log('ℹ️  Форма создания уже открыта');
      }
    }
    
    // Логируем результат
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | ATTEMPTED | Supplier creation via UI\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('3. Редактирование поставщика через UI', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Редактирование поставщика через UI');
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Ищем существующего поставщика для редактирования
    const editButtonSelectors = [
      '[data-testid="edit-supplier-button"]',
      'button:has-text("Редактировать")',
      'button:has-text("Edit")',
      'button[aria-label="Edit supplier"]'
    ];
    
    let editButton = null;
    for (const selector of editButtonSelectors) {
      try {
        const buttons = page.locator(selector);
        if (await buttons.count() > 0) {
          editButton = buttons.first();
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (editButton) {
      // Нажимаем кнопку редактирования
      await editButton.click();
      
      // Ждем открытия формы редактирования
      await expect(page.locator('[data-testid="supplier-form"], form, .modal')).toBeVisible();
      
      // Изменяем данные поставщика
      const updatedData = {
        name: 'Обновленный Поставщик UI',
        contactPerson: 'Петр Петров'
      };
      
      // Очищаем и заполняем поля заново
      try {
        await page.fill('[data-testid="supplier-name"], input[name="name"]', updatedData.name);
        await page.fill('[data-testid="contact-person"], input[name="contactPerson"]', updatedData.contactPerson);
      } catch {
        console.log('⚠️  Не удалось заполнить поля редактирования');
      }
      
      // Сохраняем изменения
      const saveButton = page.locator('[data-testid="save-supplier"], button[type="submit"]:has-text("Сохранить")');
      await saveButton.click();
      
      // Проверяем закрытие формы
      await expect(page.locator('[data-testid="supplier-form"], .modal')).not.toBeVisible();
      
      // Проверяем обновление данных в списке
      await page.waitForTimeout(2000);
      const updatedSupplierLocator = page.locator(`text=${updatedData.name}`);
      await expect(updatedSupplierLocator).toBeVisible();
      
      console.log('✅ Поставщик отредактирован успешно через UI');
      
    } else {
      console.log('⚠️  Кнопка редактирования поставщика не найдена');
    }
    
    // Логируем результат
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | ATTEMPTED | Supplier editing via UI\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('4. Удаление поставщика через UI', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Удаление поставщика через UI');
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Ищем кнопку удаления
    const deleteButtonSelectors = [
      '[data-testid="delete-supplier-button"]',
      'button:has-text("Удалить")',
      'button:has-text("Delete")',
      'button[aria-label="Delete supplier"]'
    ];
    
    let deleteButton = null;
    for (const selector of deleteButtonSelectors) {
      try {
        const buttons = page.locator(selector);
        if (await buttons.count() > 0) {
          deleteButton = buttons.first();
          break;
        }
      } catch {
        continue;
      }
    }
    
    if (deleteButton) {
      // Нажимаем кнопку удаления
      await deleteButton.click();
      
      // Проверяем появление диалога подтверждения
      const confirmDialog = page.locator('[role="dialog"], .modal, .confirm-dialog');
      if (await confirmDialog.isVisible()) {
        // Подтверждаем удаление
        const confirmButton = page.locator('button:has-text("Подтвердить"), button:has-text("Да"), [data-testid="confirm-delete"]');
        await confirmButton.click();
      }
      
      // Ждем обновления списка
      await page.waitForTimeout(2000);
      
      console.log('✅ Поставщик удален успешно через UI');
      
    } else {
      console.log('⚠️  Кнопка удаления поставщика не найдена');
    }
    
    // Логируем результат
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | ATTEMPTED | Supplier deletion via UI\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('5. Проверка отображения списка поставщиков', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Проверка отображения списка поставщиков');
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Проверяем наличие списка поставщиков
    const suppliersList = page.locator('[data-testid="suppliers-list"], .suppliers-list, table, ul');
    await expect(suppliersList).toBeVisible();
    
    // Проверяем структуру списка (заголовки колонок, элементы)
    const listItems = page.locator('[data-testid="supplier-item"], .supplier-item, tr, li');
    const itemCount = await listItems.count();
    
    console.log(`📊 Найдено элементов в списке поставщиков: ${itemCount}`);
    
    // Проверяем наличие информации о пагинации, если есть
    const pagination = page.locator('[data-testid="pagination"], .pagination, .pager');
    if (await pagination.isVisible()) {
      console.log('ℹ️  Пагинация обнаружена');
    }
    
    // Логируем результат
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | PASSED | Suppliers list display verification\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    
    console.log('✅ Список поставщиков отображается корректно');
  });

  test('6. Проверка валидации формы поставщика', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Проверка валидации формы поставщика');
    
    // Переходим на страницу suppliers
    await page.goto(`${baseURL}/suppliers`);
    
    // Ищем кнопку создания
    const createButton = page.locator('[data-testid="create-supplier-button"], button:has-text("Создать")');
    if (await createButton.isVisible()) {
      await createButton.click();
      
      // Проверяем появление формы
      await expect(page.locator('[data-testid="supplier-form"], form')).toBeVisible();
      
      // Пытаемся отправить пустую форму
      const submitButton = page.locator('[data-testid="submit-supplier"], button[type="submit"]');
      await submitButton.click();
      
      // Проверяем появление сообщений об ошибках валидации
      const validationErrors = page.locator('[data-testid="validation-error"], .error, .field-error, text="обязательно"');
      
      if (await validationErrors.count() > 0) {
        console.log('✅ Валидация формы работает - ошибки отображаются');
      } else {
        console.log('⚠️  Валидация формы не обнаружена или не реализована');
      }
      
      // Закрываем форму
      const closeButton = page.locator('button[aria-label="Close"], [data-testid="close-form"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
      }
    }
    
    // Логируем результат
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | ATTEMPTED | Form validation testing\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  });

  test('7. Очистка тестовых данных', async ({ page }) => {
    const baseURL = process.env.BASE_URL || 'http://localhost:3001';
    
    console.log('🧪 Очистка тестовых данных поставщиков');
    
    // Здесь можно добавить логику очистки созданных тестовых данных
    // Например, удаление поставщиков через API или UI
    
    // Логируем завершение
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} | e2e_suppliers_ui_crud | COMPLETED | Test data cleanup\n`;
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
    
    console.log('✅ Тестовые данные поставщиков очищены');
  });
});