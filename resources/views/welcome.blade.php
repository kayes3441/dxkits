<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LIS Platform</title>
    <script>
        (function () {
            try {
                var theme = localStorage.getItem('lis-theme');
                var isLight = theme === 'light';
                document.documentElement.classList.toggle('dark', !isLight);
                document.documentElement.style.colorScheme = isLight ? 'light' : 'dark';
            } catch (error) {
                document.documentElement.classList.add('dark');
            }
        })();
    </script>
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body>
    <div id="app"></div>
</body>
</html>
