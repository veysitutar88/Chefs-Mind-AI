# PR-1/F — Redeploy workflow (prod)

Контекст:
- Файл оркестрации: docker-compose.prod.yml (из корня репозитория).
- Цели:
  - Frontend (Next.js) доступен на http://localhost:3000.
  - Backend собирается (TypeScript → dist) и запускается node dist/server/index.js.
- Среда: Windows 11 (cmd.exe по умолчанию), также доступны PowerShell и WSL.
- Использовать docker compose (v2). Если недоступно — заменить на docker-compose.

Подготовка (выполнять из корня репозитория):
- Убедиться, что Docker Desktop запущен.
- Освободить порт 3000 на хосте.
- Опционально экспортировать COMPOSE_FILE, чтобы не дублировать -f.

down

cmd.exe:
1) set COMPOSE_FILE=docker-compose.prod.yml
2) docker compose config || exit /b 1
3) docker compose down --remove-orphans || exit /b 1

PowerShell:
1) $env:COMPOSE_FILE = "docker-compose.prod.yml"
2) docker compose config
3) if ($LASTEXITCODE -ne 0) { exit 1 }
4) docker compose down --remove-orphans
5) if ($LASTEXITCODE -ne 0) { exit 1 }

Bash/WSL:
1) export COMPOSE_FILE=docker-compose.prod.yml
2) docker compose config || exit 1
3) docker compose down --remove-orphans || exit 1

up

cmd.exe:
1) docker compose up -d --build || exit /b 1

PowerShell:
1) docker compose up -d --build
2) if ($LASTEXITCODE -ne 0) { exit 1 }

Bash/WSL:
1) docker compose up -d --build || exit 1

ps/logs

cmd.exe:
1) docker compose ps || exit /b 1
2) docker compose logs --no-color --tail=200 || exit /b 1

PowerShell:
1) docker compose ps
2) if ($LASTEXITCODE -ne 0) { exit 1 }
3) docker compose logs --no-color --tail=200
4) if ($LASTEXITCODE -ne 0) { exit 1 }

Bash/WSL:
1) docker compose ps || exit 1
2) docker compose logs --no-color --tail=200 || exit 1

smoke

Ожидание готовности фронтенда (:3000) с таймаутом 3 минуты, затем базовые проверки 200 OK на /.

cmd.exe:
1) powershell -NoProfile -Command "$deadline=(Get-Date).AddMinutes(3); $ok=$false; while((Get-Date) -lt $deadline){ try { $r=Invoke-WebRequest -UseBasicParsing http://localhost:3000/ -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 500){ $ok=$true; break } } catch {}; Start-Sleep -Seconds 2 }; if(-not $ok){ Write-Error 'Frontend not ready on :3000'; exit 1 }"
2) powershell -NoProfile -Command "$r=Invoke-WebRequest -UseBasicParsing http://localhost:3000/ -TimeoutSec 10; if($r.StatusCode -ne 200){ Write-Error 'Smoke / failed'; exit 1 }"

PowerShell:
1) $deadline = (Get-Date).AddMinutes(3)
2) $ok = $false
3) while ((Get-Date) -lt $deadline) {
     try {
       $r = Invoke-WebRequest -UseBasicParsing http://localhost:3000/ -TimeoutSec 5
       if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { $ok = $true; break }
     } catch {}
     Start-Sleep -Seconds 2
   }
4) if (-not $ok) { Write-Error "Frontend not ready on :3000"; exit 1 }
5) $r = Invoke-WebRequest -UseBasicParsing http://localhost:3000/ -TimeoutSec 10
6) if ($r.StatusCode -ne 200) { Write-Error "Smoke / failed"; exit 1 }

Bash/WSL:
1) ok=0; for i in $(seq 1 90); do if curl -fsS http://localhost:3000/ >/dev/null; then ok=1; break; fi; sleep 2; done; [ "$ok" = "1" ] || { echo "Frontend not ready on :3000"; exit 1; }
2) code=$(curl -fsS -o /dev/null -w "%{http_code}" http://localhost:3000/); [ "$code" = "200" ] || { echo "Smoke / failed ($code)"; exit 1; }

checkpoint

При успешном прохождении smoke зафиксировать чекпоинт: дата/время, версия docker compose, текущий git-коммит (если доступен).

cmd.exe:
1) if not exist .kilocode\checkpoints mkdir .kilocode\checkpoints
2) powershell -NoProfile -Command "$ver=(docker compose version) -join ' '; $commit=''; try { $commit=(git rev-parse --short HEAD) } catch {}; Set-Content -Encoding utf8 -Path '.\ .kilocode\checkpoints\pr1f_redeploy.ok'.Replace(' ','') -Value ('date=' + (Get-Date -Format o) + \"`n\" + 'compose=' + $ver + \"`n\" + 'commit=' + $commit)"

PowerShell:
1) $dir = ".kilocode/checkpoints"
2) if (!(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
3) $ver = (docker compose version) -join " "
4) $commit = ""; try { $commit = (git rev-parse --short HEAD) } catch {}
5) "date=$(Get-Date -Format o)`ncompose=$ver`ncommit=$commit" | Out-File -Encoding utf8 -FilePath "$dir/pr1f_redeploy.ok"

Bash/WSL:
1) mkdir -p .kilocode/checkpoints
2) { echo "date=$(date -Iseconds)"; echo "compose=$(docker compose version)"; echo "commit=$(git rev-parse --short HEAD 2>/dev/null || true)"; } > .kilocode/checkpoints/pr1f_redeploy.ok

Примечания:
- Все команды запускать из корня репозитория.
- При отсутствии docker compose v2 можно заменить команды на docker-compose (с теми же аргументами).
- В случае неуспеха любого шага немедленно завершать процесс с ненулевым кодом выхода.