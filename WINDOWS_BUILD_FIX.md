# Windows Build Fix - Prisma DLL Lock Error

## Problem
When running `npm run build` on Windows, you may encounter:
```
EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...' -> '...query_engine-windows.dll.node'
```

This happens because the Prisma query engine DLL file is locked by another process.

## Solution 1: Close Running Processes (Recommended)

1. **Close any dev servers**:
   ```powershell
   # Stop any running `npm run dev` or `next dev` processes
   # Press Ctrl+C in the terminal where they're running
   ```

2. **Close Prisma Studio** (if open):
   ```powershell
   # Stop any `npx prisma studio` processes
   ```

3. **Kill Node processes** (if needed):
   ```powershell
   # Find Node processes
   Get-Process node -ErrorAction SilentlyContinue
   
   # Kill specific process (replace PID with actual process ID)
   Stop-Process -Id <PID> -Force
   
   # Or kill all Node processes (use with caution!)
   Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
   ```

4. **Try building again**:
   ```powershell
   npm run build
   ```

## Solution 2: Clean Prisma Cache

1. **Delete Prisma cache**:
   ```powershell
   Remove-Item -Recurse -Force node_modules\.prisma -ErrorAction SilentlyContinue
   ```

2. **Regenerate Prisma client**:
   ```powershell
   npx prisma generate
   ```

3. **Try building again**:
   ```powershell
   npm run build
   ```

## Solution 3: Build Without Prisma Generate (Temporary)

If you need to build immediately and Prisma client is already generated:

1. **Modify package.json temporarily**:
   ```json
   "build": "next build"  // Remove "prisma generate &&"
   ```

2. **Build**:
   ```powershell
   npm run build
   ```

3. **Restore package.json** after build

## Solution 4: Use WSL or Linux (Alternative)

If the issue persists, consider using WSL (Windows Subsystem for Linux) or building in a Linux environment where file locking is less restrictive.

## Prevention

- Always stop dev servers before building
- Close Prisma Studio before building
- Use separate terminals for dev and build processes

