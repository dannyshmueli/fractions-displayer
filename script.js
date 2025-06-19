class FractionVisualizer {
    constructor() {
        this.fractions = [];
        this.nextId = 1;
        this.initializeEventListeners();
        this.initializeResizeHandler();
    }

    initializeEventListeners() {
        document.getElementById('addFraction').addEventListener('click', () => this.addFraction());
        document.getElementById('clearAll').addEventListener('click', () => this.clearAll());
        document.getElementById('compareAll').addEventListener('click', () => this.compareAll());
        
        // Allow adding fractions with Enter key
        ['numerator', 'denominator'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addFraction();
                }
            });
        });
    }

    addFraction() {
        const numerator = parseInt(document.getElementById('numerator').value);
        const denominator = parseInt(document.getElementById('denominator').value);

        if (!this.validateInput(numerator, denominator)) {
            return;
        }

        const fraction = {
            id: this.nextId++,
            numerator,
            denominator,
            decimal: numerator / denominator
        };

        this.fractions.push(fraction);
        this.renderFraction(fraction);
        this.updateComparisonVisibility();

        // Clear inputs and focus on numerator for next fraction
        document.getElementById('numerator').value = '';
        document.getElementById('denominator').value = '';
        document.getElementById('numerator').focus();
    }

    validateInput(numerator, denominator) {
        if (isNaN(numerator) || isNaN(denominator)) {
            alert('אנא הזן מספרים תקינים');
            return false;
        }
        if (denominator <= 0) {
            alert('המכנה חייב להיות גדול מאפס');
            return false;
        }
        if (numerator < 0) {
            alert('המונה חייב להיות גדול או שווה לאפס');
            return false;
        }
        if (denominator > 50) {
            alert('המכנה גדול מדי! אנא בחר מספר קטן מ-50');
            return false;
        }
        return true;
    }

    renderFraction(fraction) {
        const container = document.getElementById('fractionsContainer');
        const fractionDiv = document.createElement('div');
        fractionDiv.className = 'fraction-display new';
        fractionDiv.id = `fraction-${fraction.id}`;

        // Calculate responsive canvas dimensions
        const isMobile = window.innerWidth <= 768;
        const canvasWidth = isMobile ? Math.min(350, window.innerWidth - 60) : 700;
        const canvasHeight = isMobile ? 80 : 120;

        fractionDiv.innerHTML = `
            <button class="delete-btn" onclick="fractionVisualizer.deleteFraction(${fraction.id})">×</button>
            <div class="fraction-label">
                ${fraction.numerator}/${fraction.denominator} = ${fraction.decimal.toFixed(3)}
            </div>
            <canvas class="fraction-canvas" width="${canvasWidth}" height="${canvasHeight}"></canvas>
        `;

        container.appendChild(fractionDiv);
        
        // Draw the fraction visualization
        this.drawFraction(fractionDiv.querySelector('canvas'), fraction);

        // Remove animation class after animation completes
        setTimeout(() => {
            fractionDiv.classList.remove('new');
        }, 500);
    }

    drawFraction(canvas, fraction) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Calculate responsive dimensions
        const isMobile = width <= 350;
        const margin = isMobile ? 20 : 50;
        const barWidth = width - (margin * 2);
        const barHeight = isMobile ? 40 : 60;
        const barX = margin;
        const barY = isMobile ? 20 : 30;
        const segmentWidth = barWidth / fraction.denominator;

        // Draw the complete bar outline
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 3;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // Draw segment divisions
        ctx.lineWidth = 2;
        for (let i = 1; i < fraction.denominator; i++) {
            const x = barX + (i * segmentWidth);
            ctx.beginPath();
            ctx.moveTo(x, barY);
            ctx.lineTo(x, barY + barHeight);
            ctx.stroke();
        }

        // Fill the numerator segments
        ctx.fillStyle = this.getFractionColor(fraction.decimal);
        for (let i = 0; i < Math.min(fraction.numerator, fraction.denominator); i++) {
            const x = barX + (i * segmentWidth);
            ctx.fillRect(x + 2, barY + 2, segmentWidth - 4, barHeight - 4);
        }

        // Add pattern for filled segments
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < Math.min(fraction.numerator, fraction.denominator); i++) {
            const x = barX + (i * segmentWidth);
            // Draw diagonal lines pattern
            ctx.save();
            ctx.beginPath();
            ctx.rect(x + 2, barY + 2, segmentWidth - 4, barHeight - 4);
            ctx.clip();
            
            for (let j = 0; j < segmentWidth + barHeight; j += 8) {
                ctx.beginPath();
                ctx.moveTo(x + j, barY);
                ctx.lineTo(x + j - barHeight, barY + barHeight);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.stroke();
            }
            ctx.restore();
        }

        // Add labels with responsive sizing
        ctx.fillStyle = '#2c3e50';
        const labelFontSize = isMobile ? 12 : 16;
        const percentageFontSize = isMobile ? 10 : 14;
        
        ctx.font = `bold ${labelFontSize}px Arial`;
        ctx.textAlign = 'center';
        
        // Label each segment (only if there's enough space)
        if (segmentWidth >= 25) {
            for (let i = 0; i < Math.min(fraction.denominator, 20); i++) {
                const x = barX + (i * segmentWidth) + (segmentWidth / 2);
                const text = `${i + 1}`;
                ctx.fillText(text, x, barY + barHeight + (isMobile ? 15 : 20));
            }
        }

        // Add fraction value text
        ctx.font = `bold ${percentageFontSize}px Arial`;
        ctx.textAlign = 'right';
        const percentage = ((fraction.numerator / fraction.denominator) * 100).toFixed(1);
        ctx.fillText(`${percentage}%`, width - (isMobile ? 5 : 10), barY - (isMobile ? 5 : 10));
    }

    getFractionColor(decimal) {
        // Color gradient from red (small) to green (large)
        if (decimal <= 0.25) return '#ff6b6b';
        if (decimal <= 0.5) return '#feca57';
        if (decimal <= 0.75) return '#48dbfb';
        return '#0be881';
    }

    deleteFraction(id) {
        this.fractions = this.fractions.filter(f => f.id !== id);
        const element = document.getElementById(`fraction-${id}`);
        element.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            element.remove();
            this.updateComparisonVisibility();
        }, 300);
    }

    clearAll() {
        if (this.fractions.length === 0) return;
        
        if (confirm('האם אתה בטוח שברצונך למחוק את כל השברים?')) {
            this.fractions = [];
            document.getElementById('fractionsContainer').innerHTML = '';
            this.updateComparisonVisibility();
        }
    }

    updateComparisonVisibility() {
        const comparisonSection = document.getElementById('comparisonSection');
        if (this.fractions.length >= 2) {
            comparisonSection.style.display = 'block';
        } else {
            comparisonSection.style.display = 'none';
        }
    }

    compareAll() {
        if (this.fractions.length < 2) {
            alert('צריך לפחות 2 שברים כדי להשוות');
            return;
        }

        // Sort fractions by value
        const sortedFractions = [...this.fractions].sort((a, b) => a.decimal - b.decimal);
        
        let comparisonHTML = '<div style="font-size: 1.4rem; margin-bottom: 20px;"><strong>סדר השברים מהקטן לגדול:</strong></div>';
        
        const isMobile = window.innerWidth <= 768;
        const cardStyle = isMobile ? 
            'background: ${color}; color: white; padding: 12px; border-radius: 8px; text-align: center; min-width: 90px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); margin: 5px;' :
            'background: ${color}; color: white; padding: 15px; border-radius: 10px; text-align: center; min-width: 120px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);';
        
        comparisonHTML += `<div style="display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: ${isMobile ? '8px' : '15px'};">`;
        
        sortedFractions.forEach((fraction, index) => {
            const percentage = ((fraction.numerator / fraction.denominator) * 100).toFixed(1);
            const color = this.getFractionColor(fraction.decimal);
            const fontSize = isMobile ? '1.1rem' : '1.3rem';
            const smallFontSize = isMobile ? '0.8rem' : '0.9rem';
            
            comparisonHTML += `
                <div style="${cardStyle.replace('${color}', color)}">
                    <div style="font-size: ${fontSize}; font-weight: bold;">${fraction.numerator}/${fraction.denominator}</div>
                    <div style="font-size: ${smallFontSize}; opacity: 0.9;">${percentage}%</div>
                </div>
            `;
            
            if (index < sortedFractions.length - 1) {
                comparisonHTML += `<div style="font-size: ${isMobile ? '1.5rem' : '2rem'}; color: #6c757d;">❮</div>`;
            }
        });
        
        comparisonHTML += '</div>';

        // Add some comparison insights
        const smallest = sortedFractions[0];
        const largest = sortedFractions[sortedFractions.length - 1];
        
        comparisonHTML += `
            <div style="margin-top: 25px; padding: 20px; background: #e3f2fd; border-radius: 10px; border-right: 4px solid #2196f3;">
                <div style="margin-bottom: 10px;"><strong>השבר הקטן ביותר:</strong> ${smallest.numerator}/${smallest.denominator} = ${(smallest.decimal * 100).toFixed(1)}%</div>
                <div><strong>השבר הגדול ביותר:</strong> ${largest.numerator}/${largest.denominator} = ${(largest.decimal * 100).toFixed(1)}%</div>
            </div>
        `;

        document.getElementById('comparisonResult').innerHTML = comparisonHTML;
    }

    initializeResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.redrawAllFractions();
            }, 250);
        });
    }

    redrawAllFractions() {
        this.fractions.forEach(fraction => {
            const fractionElement = document.getElementById(`fraction-${fraction.id}`);
            if (fractionElement) {
                const canvas = fractionElement.querySelector('canvas');
                const isMobile = window.innerWidth <= 768;
                const newWidth = isMobile ? Math.min(350, window.innerWidth - 60) : 700;
                const newHeight = isMobile ? 80 : 120;
                
                canvas.width = newWidth;
                canvas.height = newHeight;
                this.drawFraction(canvas, fraction);
            }
        });
    }
}

// Initialize the fraction visualizer when the page loads
let fractionVisualizer;
document.addEventListener('DOMContentLoaded', () => {
    fractionVisualizer = new FractionVisualizer();
});

// Add fade out animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-30px);
        }
    }
`;
document.head.appendChild(style); 