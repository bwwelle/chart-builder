@echo off

pushd F:\InstalledPrograms\ImageMagick-6.9.0-Q16\

convert -units PixelsPerInch "C:\Users\bweller\Desktop\ChartBuilder\SVG\CurrentVersion\test.svg" -density 600 "C:\Users\bweller\Desktop\ChartBuilder\SVG\CurrentVersion\test.png"