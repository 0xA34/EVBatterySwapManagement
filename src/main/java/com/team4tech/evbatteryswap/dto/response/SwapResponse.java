package com.team4tech.evbatteryswap.dto.response;

import java.time.Instant;

/**
 * Kết quả trả về sau khi thực hiện đổi pin thành công.
 *
 * @param returnedBattery    Thông tin pin cũ đã trả lại trạm.
 * @param returnedBatterySoh SoH của pin cũ ngay tại thời điểlculatem trả (đã reca + ghi log).
 * @param newBattery         Thông tin pin mới tài xế nhận.
 * @param swappedAt          Thời điểm thực hiện swap.
 * @param message            Thông báo xác nhận.
 */
public record SwapResponse(
        BatteryResponse          returnedBattery,
        BatteryDiagnosticsResponse returnedBatterySoh,
        BatteryResponse          newBattery,
        Instant                  swappedAt,
        String                   message
) {}
