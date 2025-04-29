/**
 * 格式化日期为指定格式的字符串
 * @param {string|Date} date 日期对象或日期字符串
 * @param {string} format 格式化模板，例如 YYYY-MM-DD HH:mm:ss
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    console.warn('Invalid date:', date);
    return '';
  }
  
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();
  
  const padZero = (num) => (num < 10 ? '0' + num : num);
  
  const formatMap = {
    'YYYY': year,
    'MM': padZero(month),
    'DD': padZero(day),
    'HH': padZero(hour),
    'mm': padZero(minute),
    'ss': padZero(second)
  };
  
  let result = format;
  for (const key in formatMap) {
    result = result.replace(key, formatMap[key]);
  }
  
  return result;
}

/**
 * 将时间戳或日期对象转换为 "X天X小时前" 的相对时间描述
 * @param {string|Date} date 日期对象或日期字符串
 * @returns {string} 相对时间描述
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    console.warn('Invalid date:', date);
    return '';
  }
  
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  // 转换为秒
  const seconds = Math.floor(diff / 1000);
  
  if (seconds < 60) {
    return '刚刚';
  }
  
  // 转换为分钟
  const minutes = Math.floor(seconds / 60);
  
  if (minutes < 60) {
    return `${minutes}分钟前`;
  }
  
  // 转换为小时
  const hours = Math.floor(minutes / 60);
  
  if (hours < 24) {
    return `${hours}小时前`;
  }
  
  // 转换为天
  const days = Math.floor(hours / 24);
  
  if (days < 30) {
    return `${days}天前`;
  }
  
  // 转换为月
  const months = Math.floor(days / 30);
  
  if (months < 12) {
    return `${months}个月前`;
  }
  
  // 转换为年
  const years = Math.floor(months / 12);
  return `${years}年前`;
}

/**
 * 格式化金额，添加千位分隔符
 * @param {number} amount 金额
 * @param {number} decimals 小数位数
 * @param {string} decimalSeparator 小数分隔符
 * @param {string} thousandsSeparator 千位分隔符
 * @returns {string} 格式化后的金额字符串
 */
export function formatCurrency(amount, decimals = 2, decimalSeparator = '.', thousandsSeparator = ',') {
  if (amount === null || amount === undefined) return '';
  
  const fixedAmount = parseFloat(amount).toFixed(decimals);
  const [integerPart, decimalPart] = fixedAmount.split('.');
  
  // 添加千位分隔符
  const formattedIntegerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator);
  
  return decimals > 0 
    ? `${formattedIntegerPart}${decimalSeparator}${decimalPart}` 
    : formattedIntegerPart;
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的文件大小字符串
 */
export function formatFileSize(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
} 