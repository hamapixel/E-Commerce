# Correctif publicité OWNER — React purity

Ce correctif retire `Date.now()` du rendu React de `/publicites`.

Le backend calcule désormais `has_expired` avec `timezone.now()` et le frontend
utilise directement ce booléen.

Aucune migration n'est nécessaire.

Après extraction dans `C:\Users\HP USER\Desktop\sugu_kura` :

```powershell
cd "C:\Users\HP USER\Desktop\sugu_kura"
.\.venv\Scripts\Activate.ps1
cd ".\backend"
python manage.py check

cd "C:\Users\HP USER\Desktop\sugu_kura\apps\owner"
npm run lint
npm run build
```
