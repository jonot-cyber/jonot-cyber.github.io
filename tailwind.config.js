module.exports = {
    content: ['./layouts/**/*.html'],
    theme: {
        extend: {
            colors: {
                'typescript': '#2b7489',
                'javascript': '#f1e05a',
                'shell': '#89e051',
                'lua': '#000080',
                'haskell': '#5e5086',
                'html': '#e44b23',
                'python': '#3572a5',
                'go': '#00add8',
                'java': '#b07219',
                'cpp': '#f34b7d',
		'c': '#555555',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography')
    ]
}
