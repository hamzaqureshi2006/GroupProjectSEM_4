import requests
from bs4 import BeautifulSoup
import pandas as pd
import schedule
import time
import undetected_chromedriver as uc
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import os

# Improved headers
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
}

def setup_driver():
    """Set up and return a Chrome WebDriver using undetected_chromedriver"""
    try:
        options = uc.ChromeOptions()
        options.add_argument('--headless')  # Run in headless mode
        options.add_argument('--disable-gpu')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--window-size=1920,1080')
        
        driver = uc.Chrome(options=options)
        driver.set_page_load_timeout(30)
        return driver
    except Exception as e:
        print(f"Error setting up WebDriver: {str(e)}")
        print("Make sure you have Chrome browser installed on your system.")
        return None

def get_article_text(url, source):
    """Helper function to extract article text"""
    try:
        if not url.startswith('http'):
            if 'gujaratsamachar.com' in source.lower():
                url = "https://www.gujaratsamachar.com" + url
            elif 'bbc.com' in source.lower():
                url = "https://www.bbc.com" + url
            elif 'reuters.com' in source.lower():
                url = "https://www.reuters.com" + url
            elif 'timesofindia.indiatimes.com' in source.lower():
                url = "https://timesofindia.indiatimes.com" + url
                
        # Use requests for article content as it's usually not JS-dependent
        response = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(response.content, "html.parser")
        
        # Different selectors for different sources
        if 'bbc' in source.lower():
            paragraphs = soup.select("article p, main p")
        elif 'reuters' in source.lower():
            paragraphs = soup.select("article p, div[class*='article-body'] p")
        elif 'gujaratsamachar' in source.lower():
            # Try different selectors for Gujarat Samachar
            paragraphs = soup.select("div.article-content p, .article-body p, .content p")
            if not paragraphs:
                # If no paragraphs found, try to get all text content
                paragraphs = soup.find_all('p')
        elif 'timesofindia' in source.lower():
            paragraphs = soup.select("div._3WlLe div._1PcGx")
        else:
            paragraphs = soup.select("article p, main p, .content p, .article-body p")
            
        content = ' '.join(p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True))
        return content or "No content found"
        
    except Exception as e:
        print(f"Error fetching {url}: {str(e)}")
        return "Error loading article"

def scrape_news():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scraping news...")
    news_items = []

    def scrape_bbc():
        try:
            url = "https://www.bbc.com/news"
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Get all news links
            links = soup.select("a[href*='/news/']")
            unique_links = {link.get('href') for link in links if link.get('href') and '/news/' in link.get('href')}
            
            for link in list(unique_links)[:10000]:  # Limit to 10 articles
                full_url = link if link.startswith('http') else f"https://www.bbc.com{link}"
                response = requests.get(full_url, headers=headers)
                article_soup = BeautifulSoup(response.content, "html.parser")
                
                title = article_soup.find('h1')
                if not title:
                    continue
                    
                content = get_article_text(full_url, 'bbc')
                
                news_items.append({
                    "timestamp": datetime.now(),
                    "source": "BBC",
                    "headline": title.get_text(strip=True),
                    "summary": content[:500] + "..." if len(content) > 500 else content,
                    "full_content": content,
                    "url": full_url,
                    "label": "real"
                })
                time.sleep(1)  # Be nice to the server
                
        except Exception as e:
            print(f"Error in BBC scraper: {str(e)}")
    

    def scrape_reuters():
        try:
            url = "https://www.reuters.com/world/"
            response = requests.get(url, headers=headers)
            soup = BeautifulSoup(response.content, "html.parser")
            
            # Get article links
            articles = soup.select("a[href*='/article/']")
            unique_articles = {a['href'] for a in articles if a.get('href')}
            
            for link in list(unique_articles)[:100]:  # Limit to 10 articles
                full_url = link if link.startswith('http') else f"https://www.reuters.com{link}"
                response = requests.get(full_url, headers=headers)
                article_soup = BeautifulSoup(response.content, "html.parser")
                
                title = article_soup.find('h1')
                if not title:
                    continue
                    
                content = get_article_text(full_url, 'reuters')
                
                news_items.append({
                    "timestamp": datetime.now(),
                    "source": "Reuters",
                    "headline": title.get_text(strip=True),
                    "summary": content[:500] + "..." if len(content) > 500 else content,
                    "full_content": content,
                    "url": full_url,
                    "label": "real"
                })
                time.sleep(1)
                
        except Exception as e:
            print(f"Error in Reuters scraper: {str(e)}")
            
    def scrape_gujaratsamachar():
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scraping Gujarat Samachar...")
        
        # Set up the WebDriver
        driver = setup_driver()
        if not driver:
            print("Failed to initialize WebDriver")
            return
            
        try:
            target_url = "https://www.gujaratsamachar.com/city/all/1"
            print(f"Fetching URL: {target_url}")
            
            # Load the page with Selenium
            driver.get(target_url)
            
            # Wait for the articles to load (adjust timeout as needed)
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, ".news-list, .news-card, article, [class*='news']"))
            )
            
            # Let the page load completely
            time.sleep(3)
            
            # Get the page source after JavaScript execution
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            # Try different selectors to find articles
            articles = []
            selectors = [
                'div.news-card', 
                'article.news-item', 
                'div.news-list-item',
                'div[class*="news"]',
                'article',
                'div.card',
                'div.item'
            ]
            
            for selector in selectors:
                articles = soup.select(selector)
                if articles:
                    print(f"Found {len(articles)} articles using selector: {selector}")
                    break
                    
            if not articles:
                print("No articles found with any selector")
                return
                
            print(f"Found {len(articles)} news articles")

            for i, article in enumerate(articles[:10], 1):  # Limit to 10 articles
                try:
                    # Try to find a link in the article
                    link_elem = article.find('a', href=True)
                    if not link_elem:
                        print(f"Skipping article {i}: No link found")
                        continue
                        
                    link = link_elem['href']
                    title = link_elem.get_text(strip=True) or link_elem.get('title', '')
                    
                    if not title:
                        # Try to find a title element
                        title_elem = article.find(['h2', 'h3', 'h4', 'div.news-title', 'div.title'])
                        if title_elem:
                            title = title_elem.get_text(strip=True)
                    
                    if not title or not link:
                        print(f"Skipping article {i}: Missing title or URL")
                        continue
                        
                    full_url = link if link.startswith("http") else f"https://www.gujaratsamachar.com{link}"
                    print(f"\nProcessing article {i}")
                    print(f"Headline: {title}")
                    print(f"Article URL: {full_url}")
                    
                    # Get full content
                    print("Fetching article content...")
                    full_content = get_article_text(full_url, 'gujaratsamachar')
                    print(f"Content length: {len(full_content)} characters")
                    
                    # Add to news items
                    news_items.append({
                        'timestamp': datetime.now(),
                        'source': 'Gujarat Samachar',
                        'headline': title,
                        'summary': full_content[:200] + '...' if len(full_content) > 200 else full_content,
                        'full_content': full_content,
                        'url': full_url,
                        'city': 'Gujarat',
                        'category': 'Regional',
                        'label': 'real'
                    })
                    print("Article added successfully!")
                    time.sleep(1)  # Be nice to the server
                    
                except Exception as e:
                    print(f"Error processing article {i}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue
                    
            print(f"Successfully scraped {min(len(articles), 10)} articles from Gujarat Samachar")
                    
        except Exception as e:
            print(f"Error in Gujarat Samachar scraper: {str(e)}")
            import traceback
            traceback.print_exc()
        finally:
            # Make sure to close the driver
            if driver:
                driver.quit()

    def scrape_toi():
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] Scraping Times of India...")
        try:
            url = "https://timesofindia.indiatimes.com/"
            print(f"Fetching URL: {url}")
            
            try:
                response = requests.get(url, headers=headers, timeout=10)
                response.raise_for_status()
            except Exception as e:
                print(f"Failed to fetch TOI page: {e}")
                return

            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Find the main container with class X2gqh
            headlines = []
            box = soup.find('div', class_='X2gqh')
            
            if box is not None:
                # Find all links in the box
                links = box.find_all('a', href=True)
                headlines = links[:10]  # Limit to 10 articles
        
            print(f"Found {len(headlines)} news headlines")

            for i, headline in enumerate(headlines, 1):
                try:
                    title = headline.get_text(strip=True)
                    link = headline.get('href', '')
                    
                    if not title or not link:
                        print(f"Skipping article {i}: Missing title or URL")
                        continue
                    
                    full_url = link if link.startswith("http") else f"https://timesofindia.indiatimes.com{link}"
                    print(f"\nProcessing article {i}")
                    print(f"Headline: {title}")
                    print(f"Article URL: {full_url}")
                    
                    # Get full content
                    print("Fetching article content...")
                    full_content = get_article_text(full_url, 'timesofindia')
                    print(f"Content length: {len(full_content)} characters")
                    
                    # Add to news items
                    news_items.append({
                        'timestamp': datetime.now(),
                        'source': 'Times of India',
                        'headline': title,
                        'summary': full_content[:200] + '...' if len(full_content) > 200 else full_content,
                        'full_content': full_content,
                        'url': full_url,
                        'city': 'India',
                        'category': 'National',
                        'label': 'real'
                    })
                    print("Article added successfully!")
                    time.sleep(1)  # Be nice to the server
                    
                except Exception as e:
                    print(f"Error processing article {i}: {str(e)}")
                    import traceback
                    traceback.print_exc()
                    continue
                
            print(f"Successfully scraped {len(headlines)} articles from Times of India")
                    
        except Exception as e:
            print(f"Error in TOI scraper: {str(e)}")
            import traceback
            traceback.print_exc()

    def save_to_csv():
        if news_items:
            df = pd.DataFrame(news_items)
            file_exists = os.path.isfile('news_data.csv')
            df.to_csv('news_data.csv', mode='a', index=False, header=not file_exists)
            print(f"Saved {len(df)} articles to CSV")

    try:
        # Run all scrapers
        scrape_bbc()
        scrape_reuters()
        scrape_gujaratsamachar()
        scrape_toi()  # Add TOI scraper
        
        # Save all collected news items
        save_to_csv()
        
    except Exception as e:
        print(f"Error in main scraper: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print(f"[Finished at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}]\n")

# Schedule job every hour
schedule.every(1).hours.do(scrape_news)

# Initial run
scrape_news()

# Keep the script running
while True:
    schedule.run_pending()
    time.sleep(60)  # Check every minute