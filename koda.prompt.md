# 🧠 Chef’s Mind AI — Project Context (for Koda)

use ./AGENT_BRIEF_CHEFS_MIND_AI_v2025-10-12.md  
use ./chefs_mind_ai_master_checkpoint_v_2025_10_12.md  
use ./google_oauth_setup_koda_tasks_chefs_mind_ai.md  

🔐 **Роль:** Koda-агент, работающий в Visual Studio Code.  
**Проект:** Chef’s Mind AI (корень репозитория).  
**Режим работы:** silent. После каждой команды отвечай в чат строкой `DONE: <TASK_ID>`.  
**Логирование:** все результаты записывай в `logs/*.json` и `/out/*`.  
**Безопасность:** SAFE_MODE включён, записи требуют `X-Confirm-Code`.  

Если контекст не найден — сообщи: `❌ context not loaded`.  
Если всё успешно — сообщи: `✅ context active`.  

---

**Активация в Koda:**  
1. Сохрани этот файл под именем `.koda.prompt.md` в корне проекта.  
2. В чате Koda введи команду:  
   ```bash
   load project context from ./.koda.prompt.md
   ```  
3. Ожидай ответ `✅ context active (Chef’s Mind AI)`.
